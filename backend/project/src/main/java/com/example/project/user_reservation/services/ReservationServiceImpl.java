package com.example.project.user_reservation.services;

import com.example.project.ceo_car_seat.model.Seat;
import com.example.project.ceo_car_seat.repository.SeatRepository;
import com.example.project.discount.services.DiscountService;
import com.example.project.ceo_policy.services.CancellationPolicyService;
import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.ceo_tour.tour.model.TourStatus;
import com.example.project.ceo_tour.tour.repository.TourRepository;
import com.example.project.ceo_tour.tour_car.repository.TourVehicleRepository;
import com.example.project.profile.ceoinfo.model.BankAccount;
import com.example.project.profile.ceoinfo.repository.BankAccountRepository;
import com.example.project.user_reservation.dto.*;
import com.example.project.user_reservation.model.*;
import com.example.project.user_reservation.repository.*;
import com.example.project.users.model.User;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.user_reservation.repository.RefundRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final PassengerRepository passengerRepository;
    private final ReservationPassengerRepository reservationPassengerRepository;
    private final ReservationSeatRepository reservationSeatRepository;
    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final BankAccountRepository bankAccountRepository;
    private final TourVehicleRepository tourVehicleRepository;
    private final SeatRepository seatRepository;
    private final PaymentProofRepository paymentProofRepository;
    private final CancellationPolicyService cancellationPolicyService;
    private final RefundRequestRepository refundRequestRepository;
    private final DiscountService discountService;
    private final ObjectMapper objectMapper = new ObjectMapper(); // برای JSON

    private User getCurrentUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("کاربر یافت نشد: " + username));
    }

    @Override
    @Transactional
    public ReservationResponseDto createReservation(String username, CreateReservationRequestDto request) {
        log.info("Creating reservation for user: {}, tourId: {}", username, request.getTourId());

        User user = getCurrentUser(username);
        Tour tour = tourRepository.findBookableById(request.getTourId())
                .orElseThrow(() -> new RuntimeException("تور مورد نظر یافت نشد، غیرفعال است یا تاریخ آن گذشته است"));

        Long confirmedCount = reservationRepository.countConfirmedByTourId(tour.getId());
        int availableCapacity = (tour.getCapacity() != null ? tour.getCapacity() : 0) - confirmedCount.intValue();
        int requestedSeatCount = request.getSeatIds().size();

        if (availableCapacity < requestedSeatCount) {
            throw new RuntimeException("ظرفیت تور تکمیل است. ظرفیت باقیمانده: " + availableCapacity);
        }

        Set<Long> bookedSeats = reservationSeatRepository.findBookedSeatIdsByTourId(tour.getId());
        for (Long seatId : request.getSeatIds()) {
            if (bookedSeats.contains(seatId)) {
                throw new RuntimeException("صندلی با شناسه " + seatId + " قبلاً رزرو شده است");
            }
        }

        int passengerCount = request.getPassengers().size();

        // ===== محاسبه قیمت با اعمال تخفیف‌ها =====
        BigDecimal unitPrice = discountService.getEffectiveUnitPrice(tour);
        BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(passengerCount));

        Integer appliedPercent = discountService.getActiveSpecialPercent(tour.getId());
        BigDecimal discountAmount = BigDecimal.ZERO;
        String discountCode = null;

        // کد تخفیف (اختیاری) — اگر کاربر فرستاده بود
        if (request.getDiscountCode() != null && !request.getDiscountCode().isBlank()) {
            BigDecimal discountedTotal = discountService.applyCode(
                    request.getDiscountCode(), username, totalPrice);
            discountAmount = totalPrice.subtract(discountedTotal);
            totalPrice = discountedTotal;
            discountCode = request.getDiscountCode().trim().toUpperCase();
            // درصد نهایی برای مانیتورینگ — اگر تور ویژه هم داشت، تخفیف کد روی همان مبنا حساب شده
            appliedPercent = null; // درصد ترکیبی پیچیده است؛ کد به‌صورت مبلغ ثبت می‌شود
        } else if (appliedPercent != null) {
            BigDecimal originalTotal = tour.getPrice().multiply(BigDecimal.valueOf(passengerCount));
            discountAmount = originalTotal.subtract(totalPrice);
        }

        Reservation reservation = Reservation.builder()
                .user(user)
                .tour(tour)
                .totalPrice(totalPrice)
                .passengerCount(passengerCount)
                .discountPercent(appliedPercent)
                .discountAmount(discountAmount.signum() > 0 ? discountAmount : null)
                .discountCode(discountCode)
                .status(ReservationStatus.PENDING_PAYMENT)
                .expiresAt(LocalDateTime.now().plusHours(12))
                .build();

        reservation = reservationRepository.save(reservation);

        for (PassengerDto passengerDto : request.getPassengers()) {
            Passenger passenger = passengerRepository.findByNationalCode(passengerDto.getNationalCode())
                    .orElseGet(() -> {
                        Passenger newPassenger = Passenger.builder()
                                .user(user)
                                .firstName(passengerDto.getFirstName())
                                .lastName(passengerDto.getLastName())
                                .nationalCode(passengerDto.getNationalCode())
                                .mobile(passengerDto.getMobile())
                                .birthDate(passengerDto.getBirthDate())
                                .build();
                        return passengerRepository.save(newPassenger);
                    });

            ReservationPassenger rp = ReservationPassenger.builder()
                    .reservation(reservation)
                    .passenger(passenger)
                    .build();
            reservationPassengerRepository.save(rp);
        }

        for (Long seatId : request.getSeatIds()) {
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new RuntimeException("صندلی با شناسه " + seatId + " یافت نشد"));

            ReservationSeat rs = ReservationSeat.builder()
                    .reservation(reservation)
                    .seat(seat)
                    .tourId(tour.getId())
                    .build();
            reservationSeatRepository.save(rs);
        }

        log.info("Reservation created with id: {}, totalPrice: {}, passengerCount: {}",
                reservation.getId(), totalPrice, passengerCount);

        return toResponseDto(reservation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDto> getMyReservations(String username) {
        log.debug("Fetching reservations for user: {}", username);
        User user = getCurrentUser(username);

        return reservationRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponseDto getReservationById(String username, Long reservationId) {
        log.debug("Fetching reservation: {} for user: {}", reservationId, username);
        User user = getCurrentUser(username);

        Reservation reservation = reservationRepository.findByIdAndUserId(reservationId, user.getId())
                .orElseThrow(() -> new RuntimeException("رزرو مورد نظر یافت نشد"));

        return toResponseDto(reservation);
    }

    @Override
    @Transactional
    public CancelReservationResponseDto cancelReservation(String username, Long reservationId, CancelReservationRequestDto request) {
        log.info("Cancelling reservation: {} for user: {}", reservationId, username);

        User user = getCurrentUser(username);
        Reservation reservation = reservationRepository.findByIdAndUserId(reservationId, user.getId())
                .orElseThrow(() -> new RuntimeException("رزرو مورد نظر یافت نشد"));

        if (reservation.getStatus() != ReservationStatus.CONFIRMED &&
                reservation.getStatus() != ReservationStatus.PENDING_PAYMENT) {
            throw new RuntimeException("امکان لغو این رزرو وجود ندارد. وضعیت فعلی: " + reservation.getStatus().getPersianName());
        }

        // مبلغ برگشتی (کل مبلغ)
        BigDecimal refundAmount = reservation.getTotalPrice();

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setCanceledAt(LocalDateTime.now());
        reservationRepository.save(reservation);

        reservationSeatRepository.deleteAllByReservationId(reservationId);
        reservationPassengerRepository.deleteAllByReservationId(reservationId);

        Tour tour = reservation.getTour();
        if (tour.getStatus() == TourStatus.SOLD_OUT) {
            Long confirmedCount = reservationRepository.countConfirmedByTourId(tour.getId());
            if (tour.getCapacity() != null && confirmedCount < tour.getCapacity()) {
                tour.setStatus(TourStatus.ACTIVE);
                tourRepository.save(tour);
                log.info("Tour {} is now ACTIVE again", tour.getId());
            }
        }

        if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
            RefundRequest refundRequest = RefundRequest.builder()
                    .reservation(reservation)
                    .refundAmount(refundAmount)
                    .targetCardNumber(request.getTargetCardNumber())
                    .status(RefundStatus.PENDING)
                    .build();
            refundRequestRepository.save(refundRequest);
            log.info("Refund request created for reservation: {}, amount: {}", reservationId, refundAmount);
        }

        log.info("Reservation cancelled: {}, refundAmount: {}", reservationId, refundAmount);

        return CancelReservationResponseDto.builder()
                .reservationId(reservation.getId())
                .status(reservation.getStatus().name())
                .statusPersian(reservation.getStatus().getPersianName())
                .refundAmount(refundAmount)
                .message(refundAmount.compareTo(BigDecimal.ZERO) > 0 ?
                        "رزرو با موفقیت لغو شد. مبلغ " + refundAmount + " تومان به حساب شما برگشت داده خواهد شد." :
                        "رزرو با موفقیت لغو شد. با توجه به سیاست لغو، هیچ مبلغی برگشت داده نمی‌شود.")
                .build();
    }

    @Override
    @Transactional
    public void uploadPaymentProof(String username, Long reservationId, PaymentProofRequestDto request) {
        log.info("Uploading payment proof for reservation: {}", reservationId);

        User user = getCurrentUser(username);
        Reservation reservation = reservationRepository.findByIdAndUserId(reservationId, user.getId())
                .orElseThrow(() -> new RuntimeException("رزرو مورد نظر یافت نشد"));

        if (reservation.getStatus() != ReservationStatus.PENDING_PAYMENT) {
            throw new RuntimeException("فقط رزروهای در انتظار پرداخت قابل آپلود رسید هستند");
        }

        BankAccount bankAccount = bankAccountRepository.findByUserId(reservation.getTour().getCreatedBy().getId())
                .orElseThrow(() -> new RuntimeException("اطلاعات بانکی برای مدیر آژانس یافت نشد"));

        if (paymentProofRepository.existsByReservationId(reservationId)) {
            throw new RuntimeException("قبلاً برای این رزرو رسید آپلود شده است");
        }

        PaymentProof paymentProof = PaymentProof.builder()
                .reservation(reservation)
                .sourceCardNumber(request.getSourceCardNumber())
                .destinationCardNumber(bankAccount.getCardNumber())
                .receiptImageUrl(request.getReceiptImageUrl())
                .build();
        paymentProofRepository.save(paymentProof);

        reservation.setStatus(ReservationStatus.WAITING_FOR_VERIFICATION);
        reservationRepository.save(reservation);

        log.info("Payment proof uploaded for reservation: {}", reservationId);
    }

    // ===== سیستم جدید کنسلی (چند مرحله‌ای) =====

    @Override
    @Transactional
    public RefundRequestResponseDto requestCancellation(String username, Long reservationId, CancelRequestDto request) {
        log.info("Cancel request for reservation: {} by user: {}", reservationId, username);

        User user = getCurrentUser(username);
        Reservation reservation = reservationRepository.findByIdAndUserId(reservationId, user.getId())
                .orElseThrow(() -> new RuntimeException("رزرو مورد نظر یافت نشد"));

        // فقط رزروهای تأیید شده قابل لغو هستند
        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new RuntimeException("فقط رزروهای تأیید شده قابل لغو هستند. وضعیت فعلی: " + reservation.getStatus().getPersianName());
        }

        // بررسی وجود درخواست کنسلی فعال - اگر موجود بود، همان را برمی‌گردانیم (idempotent)
        Optional<RefundRequest> existingActive = refundRequestRepository.findActiveByReservationId(reservationId);
        if (existingActive.isPresent()) {
            log.info("Active refund request already exists for reservation: {} (id={})", reservationId, existingActive.get().getId());
            return toRefundRequestDto(existingActive.get());
        }

        // محاسبه مبلغ برگشتی (کل مبلغ - بدون سیاست لغو)
        BigDecimal refundAmount = reservation.getTotalPrice();
        log.info("Refund amount for reservation {}: {} (full amount)", reservationId, refundAmount);

        // تعیین مسافران و صندلی‌های مورد نظر برای لغو
        List<Long> passengerIds = request.getPassengerIds();
        List<Long> seatIdsForCancel;

        if (passengerIds != null && !passengerIds.isEmpty()) {
            // لغو انتخابی - فقط مسافران مشخص شده
            List<ReservationPassenger> rps = reservationPassengerRepository.findAllByReservationId(reservationId);
            Set<Long> existingPassengerIds = rps.stream()
                    .map(rp -> rp.getPassenger().getId())
                    .collect(Collectors.toSet());

            for (Long pid : passengerIds) {
                if (!existingPassengerIds.contains(pid)) {
                    throw new RuntimeException("مسافر با شناسه " + pid + " در این رزرو یافت نشد");
                }
            }

            // دریافت صندلی‌های مسافران انتخاب شده
            // هر مسافر یک صندلی دارد - منطبق بر index در لیست
            List<Long> allSeatIds = new ArrayList<>(reservationSeatRepository.findSeatIdsByReservationId(reservationId));
            List<Long> allPassengerIds = rps.stream()
                    .map(rp -> rp.getPassenger().getId())
                    .collect(Collectors.toList());

            seatIdsForCancel = new ArrayList<>();
            for (int i = 0; i < allPassengerIds.size() && i < allSeatIds.size(); i++) {
                if (passengerIds.contains(allPassengerIds.get(i))) {
                    seatIdsForCancel.add(allSeatIds.get(i));
                }
            }
        } else {
            // لغو کامل کل رزرو
            passengerIds = Collections.emptyList();
            seatIdsForCancel = new ArrayList<>(reservationSeatRepository.findSeatIdsByReservationId(reservationId));
        }

        // ذخیره passengerIds و seatIds به صورت JSON
        String passengerIdsJson = toJson(passengerIds);
        String seatIdsJson = toJson(seatIdsForCancel);

        // ایجاد RefundRequest با وضعیت PENDING
        RefundRequest refundRequest = RefundRequest.builder()
                .reservation(reservation)
                .refundAmount(refundAmount)
                .targetCardNumber(request.getTargetCardNumber())
                .status(RefundStatus.PENDING)
                .cancelledPassengerIds(passengerIdsJson)
                .cancelledSeatIds(seatIdsJson)
                .build();
        refundRequest = refundRequestRepository.save(refundRequest);

        log.info("Cancel request created: refundRequestId={}, amount={}, passengerCount={}",
                refundRequest.getId(), refundAmount,
                passengerIds.isEmpty() ? "ALL" : passengerIds.size());

        return toRefundRequestDto(refundRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public RefundRequestResponseDto getRefundRequestStatus(String username, Long reservationId) {
        log.debug("Fetching refund request status for reservation: {}", reservationId);

        User user = getCurrentUser(username);
        Reservation reservation = reservationRepository.findByIdAndUserId(reservationId, user.getId())
                .orElseThrow(() -> new RuntimeException("رزرو مورد نظر یافت نشد"));

        RefundRequest refundRequest = refundRequestRepository.findFirstByReservationIdOrderByIdDesc(reservationId)
                .orElseThrow(() -> new RuntimeException("درخواست لغوی برای این رزرو ثبت نشده است"));

        return toRefundRequestDto(refundRequest);
    }

    @Override
    @Transactional
    public RefundRequestResponseDto confirmCancellation(String username, Long refundRequestId) {
        log.info("User {} confirming cancellation for refundRequest: {}", username, refundRequestId);

        User user = getCurrentUser(username);
        RefundRequest refundRequest = refundRequestRepository.findById(refundRequestId)
                .orElseThrow(() -> new RuntimeException("درخواست برگشت وجه یافت نشد"));

        Reservation reservation = refundRequest.getReservation();

        // بررسی مالکیت
        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("شما دسترسی به این درخواست ندارید");
        }

        if (refundRequest.getStatus() != RefundStatus.REFUND_RECEIPT_UPLOADED) {
            throw new RuntimeException("این درخواست در وضعیت تایید نیست. وضعیت فعلی: " + refundRequest.getStatus().getPersianName());
        }

        // ===== اعمال لغو نهایی =====
        List<Long> cancelledPassengerIds = parseJsonToList(refundRequest.getCancelledPassengerIds());
        List<Long> cancelledSeatIds = parseJsonToList(refundRequest.getCancelledSeatIds());

        boolean isFullCancel = cancelledPassengerIds.isEmpty();

        if (isFullCancel) {
            // لغو کامل رزرو
            reservation.setStatus(ReservationStatus.CANCELLED);
            reservation.setCanceledAt(LocalDateTime.now());
            reservationRepository.save(reservation);

            reservationSeatRepository.deleteAllByReservationId(reservation.getId());
            reservationPassengerRepository.deleteAllByReservationId(reservation.getId());
        } else {
            // لغو انتخابی - فقط مسافران و صندلی‌های مشخص شده حذف شوند
            for (Long seatId : cancelledSeatIds) {
                reservationSeatRepository.deleteBySeatIdAndReservationId(seatId, reservation.getId());
            }
            for (Long passengerId : cancelledPassengerIds) {
                reservationPassengerRepository.deleteByPassengerIdAndReservationId(passengerId, reservation.getId());
            }

            // به‌روزرسانی تعداد مسافران و مبلغ
            int remainingPassengers = reservation.getPassengerCount() - cancelledPassengerIds.size();
            BigDecimal pricePerPassenger = reservation.getTotalPrice()
                    .divide(BigDecimal.valueOf(reservation.getPassengerCount()), BigDecimal.ROUND_HALF_UP);
            BigDecimal newTotalPrice = pricePerPassenger.multiply(BigDecimal.valueOf(remainingPassengers));

            reservation.setPassengerCount(remainingPassengers);
            reservation.setTotalPrice(newTotalPrice);
            reservationRepository.save(reservation);

            log.info("Partial cancel: {} passengers remaining out of original {}",
                    remainingPassengers, reservation.getPassengerCount() + cancelledPassengerIds.size());
        }

        // بررسی وضعیت تور
        Tour tour = reservation.getTour();
        if (tour.getStatus() == TourStatus.SOLD_OUT) {
            Long confirmedCount = reservationRepository.countConfirmedByTourId(tour.getId());
            if (tour.getCapacity() != null && confirmedCount < tour.getCapacity()) {
                tour.setStatus(TourStatus.ACTIVE);
                tourRepository.save(tour);
                log.info("Tour {} is now ACTIVE again", tour.getId());
            }
        }

        // به‌روزرسانی RefundRequest
        refundRequest.setStatus(RefundStatus.CONFIRMED);
        refundRequest.setProcessedAt(LocalDateTime.now());
        refundRequestRepository.save(refundRequest);

        log.info("Cancellation confirmed for refundRequest: {}", refundRequestId);

        return toRefundRequestDto(refundRequest);
    }

    // ===== بلیط گرافیکی =====

    @Override
    @Transactional(readOnly = true)
    public TicketResponseDto getTicket(String username, Long reservationId) {
        User user = getCurrentUser(username);
        Reservation reservation = reservationRepository.findByIdAndUserId(reservationId, user.getId())
                .orElseThrow(() -> new RuntimeException("رزرو مورد نظر یافت نشد"));

        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new RuntimeException("بلیط فقط برای رزروهای تأییدشده صادر می‌شود. وضعیت فعلی: "
                    + reservation.getStatus().getPersianName());
        }

        Tour tour = reservation.getTour();

        String originCity = "";
        String destinationCity = "";
        if (tour.getBaseTour() != null && tour.getBaseTour().getOriginCity() != null) {
            originCity = tour.getBaseTour().getOriginCity().getName();
        }
        if (tour.getBaseTour() != null && tour.getBaseTour().getDestinationCity() != null) {
            destinationCity = tour.getBaseTour().getDestinationCity().getName();
        }

        String agencyName = tour.getCreatedBy() != null ? tour.getCreatedBy().getUsername() : "";

        List<PassengerDto> passengers = reservationPassengerRepository.findAllByReservationId(reservation.getId())
                .stream()
                .map(rp -> PassengerDto.builder()
                        .id(rp.getPassenger().getId())
                        .firstName(rp.getPassenger().getFirstName())
                        .lastName(rp.getPassenger().getLastName())
                        .nationalCode(rp.getPassenger().getNationalCode())
                        .mobile(rp.getPassenger().getMobile())
                        .birthDate(rp.getPassenger().getBirthDate())
                        .build())
                .collect(Collectors.toList());

        // صندلی‌ها به ترتیب رزرو (هر مسافر به ترتیب یک صندلی دارد)
        List<Long> seatIds = reservationSeatRepository.findSeatIdsByReservationIdOrdered(reservation.getId());
        Map<Long, Integer> seatNumberById = seatRepository.findAllById(seatIds).stream()
                .collect(Collectors.toMap(Seat::getId, s -> s.getSeatNumber() != null ? s.getSeatNumber() : 0));

        List<TicketPassengerDto> ticketPassengers = new ArrayList<>();
        for (int i = 0; i < passengers.size(); i++) {
            PassengerDto p = passengers.get(i);
            Integer seatNumber = i < seatIds.size() ? seatNumberById.getOrDefault(seatIds.get(i), 0) : 0;
            ticketPassengers.add(TicketPassengerDto.builder()
                    .firstName(p.getFirstName())
                    .lastName(p.getLastName())
                    .nationalCode(p.getNationalCode())
                    .mobile(p.getMobile())
                    .seatNumber(seatNumber)
                    .build());
        }

        String tourName = "";
        String tourCode = "";
        if (tour.getBaseTour() != null) {
            tourName = tour.getBaseTour().getTourName() != null ? tour.getBaseTour().getTourName() : "";
            tourCode = tour.getBaseTour().getTourCode() != null ? tour.getBaseTour().getTourCode() : "";
        }

        // نام و موبایل مشتری (خریدار) — اول مسافر اصلی، در غیر این صورت نام کاربری
        String customerName = reservation.getUser() != null ? reservation.getUser().getUsername() : "";
        String customerMobile = reservation.getUser() != null && reservation.getUser().getMobile() != null
                ? reservation.getUser().getMobile() : "";
        if (!ticketPassengers.isEmpty()) {
            TicketPassengerDto first = ticketPassengers.get(0);
            String full = (first.getFirstName() != null ? first.getFirstName() : "")
                    + " " + (first.getLastName() != null ? first.getLastName() : "");
            if (!full.trim().isEmpty()) {
                customerName = full.trim();
            }
        }

        return TicketResponseDto.builder()
                .reservationId(reservation.getId())
                .tourName(tourName)
                .tourCode(tourCode)
                .originCity(originCity)
                .destinationCity(destinationCity)
                .departureDate(tour.getDepartureDate())
                .returnDate(tour.getReturnDate())
                .agencyName(agencyName)
                .status(reservation.getStatus().name())
                .statusPersian(reservation.getStatus().getPersianName())
                .passengerCount(reservation.getPassengerCount())
                .totalPrice(reservation.getTotalPrice())
                .customerName(customerName)
                .customerMobile(customerMobile)
                .passengers(ticketPassengers)
                .build();
    }

    // ===== متدهای کمکی =====

    private String toJson(List<Long> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            log.error("Error converting list to JSON", e);
            return "[]";
        }
    }

    @SuppressWarnings("unchecked")
    private List<Long> parseJsonToList(String json) {
        if (json == null || json.isEmpty() || json.equals("[]")) {
            return Collections.emptyList();
        }
        try {
            List<Object> raw = objectMapper.readValue(json, List.class);
            List<Long> result = new ArrayList<>();
            for (Object obj : raw) {
                if (obj instanceof Number) {
                    result.add(((Number) obj).longValue());
                }
            }
            return result;
        } catch (JsonProcessingException e) {
            log.error("Error parsing JSON list", e);
            return Collections.emptyList();
        }
    }

    private RefundRequestResponseDto toRefundRequestDto(RefundRequest refundRequest) {
        Reservation reservation = refundRequest.getReservation();

        String tourName = "";
        String tourCode = "";
        if (reservation.getTour().getBaseTour() != null) {
            tourName = reservation.getTour().getBaseTour().getTourName() != null ?
                    reservation.getTour().getBaseTour().getTourName() : "";
            tourCode = reservation.getTour().getBaseTour().getTourCode() != null ?
                    reservation.getTour().getBaseTour().getTourCode() : "";
        }

        return RefundRequestResponseDto.builder()
                .id(refundRequest.getId())
                .reservationId(reservation.getId())
                .tourName(tourName)
                .tourCode(tourCode)
                .refundAmount(refundRequest.getRefundAmount())
                .targetCardNumber(refundRequest.getTargetCardNumber())
                .receiptImageUrl(refundRequest.getReceiptImageUrl())
                .status(refundRequest.getStatus().name())
                .statusPersian(refundRequest.getStatus().getPersianName())
                .rejectionReason(refundRequest.getRejectionReason())
                .cancelledPassengerIds(parseJsonToList(refundRequest.getCancelledPassengerIds()))
                .cancelledSeatIds(parseJsonToList(refundRequest.getCancelledSeatIds()))
                .userUsername(reservation.getUser() != null ? reservation.getUser().getUsername() : "")
                .userMobile(reservation.getUser() != null && reservation.getUser().getMobile() != null
                        ? reservation.getUser().getMobile() : "")
                .createdAt(refundRequest.getCreatedAt())
                .processedAt(refundRequest.getProcessedAt())
                .build();
    }

    // تبدیل به DTO - public است
    public ReservationResponseDto toResponseDto(Reservation reservation) {
        List<PassengerDto> passengers = reservationPassengerRepository.findAllByReservationId(reservation.getId())
                .stream()
                .map(rp -> PassengerDto.builder()
                        .id(rp.getPassenger().getId())
                        .firstName(rp.getPassenger().getFirstName())
                        .lastName(rp.getPassenger().getLastName())
                        .nationalCode(rp.getPassenger().getNationalCode())
                        .mobile(rp.getPassenger().getMobile())
                        .birthDate(rp.getPassenger().getBirthDate())
                        .build())
                .collect(Collectors.toList());

        Set<Long> seatIds = reservationSeatRepository.findSeatIdsByReservationId(reservation.getId());

        String tourName = "";
        String tourCode = "";
        if (reservation.getTour().getBaseTour() != null) {
            tourName = reservation.getTour().getBaseTour().getTourName() != null ?
                    reservation.getTour().getBaseTour().getTourName() : "";
            tourCode = reservation.getTour().getBaseTour().getTourCode() != null ?
                    reservation.getTour().getBaseTour().getTourCode() : "";
        }

        PaymentProofDto paymentProofDto = paymentProofRepository.findByReservationId(reservation.getId())
                .map(pp -> PaymentProofDto.builder()
                        .sourceCardNumber(pp.getSourceCardNumber())
                        .destinationCardNumber(pp.getDestinationCardNumber())
                        .receiptImageUrl(pp.getReceiptImageUrl())
                        .createdAt(pp.getCreatedAt())
                        .build())
                .orElse(null);

        String userUsername = reservation.getUser() != null ? reservation.getUser().getUsername() : "";
        String userMobile = reservation.getUser() != null && reservation.getUser().getMobile() != null
                ? reservation.getUser().getMobile() : "";

        return ReservationResponseDto.builder()
                .id(reservation.getId())
                .tourId(reservation.getTour().getId())
                .tourName(tourName)
                .tourCode(tourCode)
                .departureDate(reservation.getTour().getDepartureDate())
                .returnDate(reservation.getTour().getReturnDate())
                .totalPrice(reservation.getTotalPrice())
                .passengerCount(reservation.getPassengerCount())
                .status(reservation.getStatus().name())
                .statusPersian(reservation.getStatus().getPersianName())
                .expiresAt(reservation.getExpiresAt())
                .createdAt(reservation.getCreatedAt())
                .passengers(passengers)
                .seatIds(seatIds)
                .userUsername(userUsername)
                .userMobile(userMobile)
                .paymentProof(paymentProofDto)
                .build();
    }
}