package com.example.project.user_reservation.services;

import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.ceo_tour.tour.model.TourStatus;
import com.example.project.ceo_tour.tour.repository.TourRepository;
import com.example.project.user_reservation.dto.*;
import com.example.project.user_reservation.model.PaymentProof;
import com.example.project.user_reservation.model.RefundRequest;
import com.example.project.user_reservation.model.RefundStatus;
import com.example.project.user_reservation.model.Reservation;
import com.example.project.user_reservation.model.ReservationStatus;
import com.example.project.user_reservation.repository.PaymentProofRepository;
import com.example.project.user_reservation.repository.RefundRequestRepository;
import com.example.project.user_reservation.repository.ReservationRepository;
import com.example.project.user_reservation.repository.ReservationSeatRepository;
import com.example.project.user_reservation.services.ReservationServiceImpl;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CeoReservationServiceImpl implements CeoReservationService {

    private final ReservationRepository reservationRepository;
    private final PaymentProofRepository paymentProofRepository;
    private final ReservationSeatRepository reservationSeatRepository;
    private final TourRepository tourRepository;
    private final ReservationServiceImpl reservationService;
    private final UserRepository userRepository;
    private final RefundRequestRepository refundRequestRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDto> getPendingReservations(String username) {
        log.debug("Fetching pending reservations for CEO: {}", username);

        List<Reservation> reservations = reservationRepository.findAllWaitingForVerificationByCeoUsername(username);

        return reservations.stream()
                .map(reservationService::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReservationResponseDto approveReservation(String username, Long reservationId) {
        log.info("CEO {} approving reservation: {}", username, reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("رزرو یافت نشد"));

        // بررسی مالکیت تور توسط CEO
        if (!reservation.getTour().getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("شما دسترسی به این رزرو ندارید");
        }

        if (reservation.getStatus() != ReservationStatus.WAITING_FOR_VERIFICATION) {
            throw new RuntimeException("فقط رزروهای در انتظار تأیید قابل تأیید هستند");
        }

        // بررسی ظرفیت باقیمانده
        Tour tour = reservation.getTour();
        Long confirmedCount = reservationRepository.countConfirmedByTourId(tour.getId());
        int availableCapacity = (tour.getCapacity() != null ? tour.getCapacity() : 0) - confirmedCount.intValue();

        if (availableCapacity < reservation.getPassengerCount()) {
            throw new RuntimeException("ظرفیت تور برای تأیید این رزرو کافی نیست");
        }

        // تغییر وضعیت رزرو
        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation.setConfirmedAt(LocalDateTime.now());
        reservationRepository.save(reservation);

        // به‌روزرسانی PaymentProof
        PaymentProof paymentProof = paymentProofRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new RuntimeException("رسید پرداخت یافت نشد"));
        User ceo = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("کاربر مدیر یافت نشد"));
        paymentProof.setVerifiedAt(LocalDateTime.now());
        paymentProof.setVerifiedBy(ceo.getId());
        paymentProofRepository.save(paymentProof);

        // بررسی ظرفیت تور - اگر ظرفیت پر شد، وضعیت تور را SOLD_OUT کن
        Long newConfirmedCount = reservationRepository.countConfirmedByTourId(tour.getId());
        if (tour.getCapacity() != null && newConfirmedCount >= tour.getCapacity()) {
            tour.setStatus(TourStatus.SOLD_OUT);
            tourRepository.save(tour);
            log.info("Tour {} is now SOLD_OUT", tour.getId());
        }

        log.info("Reservation {} approved successfully", reservationId);

        return reservationService.toResponseDto(reservation);
    }

    @Override
    @Transactional
    public ReservationResponseDto rejectReservation(String username, Long reservationId, String reason) {
        log.info("CEO {} rejecting reservation: {}", username, reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("رزرو یافت نشد"));

        if (!reservation.getTour().getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("شما دسترسی به این رزرو ندارید");
        }

        if (reservation.getStatus() != ReservationStatus.WAITING_FOR_VERIFICATION) {
            throw new RuntimeException("فقط رزروهای در انتظار تأیید قابل رد هستند");
        }

        reservation.setStatus(ReservationStatus.REJECTED);
        reservationRepository.save(reservation);

        // به‌روزرسانی PaymentProof
        PaymentProof paymentProof = paymentProofRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new RuntimeException("رسید پرداخت یافت نشد"));
        paymentProof.setRejectionReason(reason);
        paymentProofRepository.save(paymentProof);

        log.info("Reservation {} rejected with reason: {}", reservationId, reason);

        return reservationService.toResponseDto(reservation);
    }        // ===== سیستم جدید کنسلی (مدیریت CEO) =====

    @Override
    @Transactional(readOnly = true)
    public List<RefundRequestResponseDto> getPendingCancelRequests(String username) {
        log.debug("Fetching cancel requests for CEO: {}", username);

        // همه وضعیت‌ها برگردانده می‌شوند (PENDING / REFUND_RECEIPT_UPLOADED / CONFIRMED / REJECTED)
        // تا CEO بتواند درخواست‌های آپلود شده و رد شده را هم ببیند
        List<RefundRequest> refundRequests = refundRequestRepository.findAllByCeoUsername(username);

        return refundRequests.stream()
                .map(this::toRefundRequestDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RefundRequestResponseDto uploadRefundReceipt(String username, CeoRefundReceiptDto request) {
        log.info("CEO {} uploading refund receipt for refundRequest: {}", username, request.getRefundRequestId());

        RefundRequest refundRequest = refundRequestRepository.findById(request.getRefundRequestId())
                .orElseThrow(() -> new RuntimeException("درخواست برگشت وجه یافت نشد"));

        Reservation reservation = refundRequest.getReservation();

        // بررسی مالکیت تور توسط CEO
        if (!reservation.getTour().getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("شما دسترسی به این درخواست ندارید");
        }

        if (refundRequest.getStatus() != RefundStatus.PENDING) {
            throw new RuntimeException("این درخواست در وضعیت انتظار بررسی نیست. وضعیت فعلی: " + refundRequest.getStatus().getPersianName());
        }

        // آپلود رسید برگشت وجه
        refundRequest.setReceiptImageUrl(request.getReceiptImageUrl());
        refundRequest.setStatus(RefundStatus.REFUND_RECEIPT_UPLOADED);
        refundRequestRepository.save(refundRequest);

        log.info("Refund receipt uploaded for refundRequest: {}", request.getRefundRequestId());

        return toRefundRequestDto(refundRequest);
    }

    @Override
    @Transactional
    public RefundRequestResponseDto rejectCancelRequest(String username, CeoRejectRefundDto request) {
        log.info("CEO {} rejecting cancel request: {}", username, request.getRefundRequestId());

        RefundRequest refundRequest = refundRequestRepository.findById(request.getRefundRequestId())
                .orElseThrow(() -> new RuntimeException("درخواست برگشت وجه یافت نشد"));

        Reservation reservation = refundRequest.getReservation();

        if (!reservation.getTour().getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("شما دسترسی به این درخواست ندارید");
        }

        if (refundRequest.getStatus() != RefundStatus.PENDING) {
            throw new RuntimeException("این درخواست در وضعیت انتظار بررسی نیست");
        }

        refundRequest.setStatus(RefundStatus.REJECTED);
        refundRequest.setRejectionReason(request.getRejectionReason());
        refundRequest.setProcessedAt(LocalDateTime.now());
        refundRequestRepository.save(refundRequest);

        log.info("Cancel request rejected: {}", request.getRefundRequestId());

        return toRefundRequestDto(refundRequest);
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

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDto> getMyTourReservations(String username) {
        log.debug("Fetching all reservations for CEO's tours: {}", username);

        List<Reservation> reservations = reservationRepository.findAllByTourCreatedByUsername(username);

        return reservations.stream()
                .map(reservationService::toResponseDto)
                .collect(Collectors.toList());
    }
}
