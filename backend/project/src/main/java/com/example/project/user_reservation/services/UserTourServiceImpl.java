package com.example.project.user_reservation.services;

import com.example.project.ceo_car.model.Vehicle;
import com.example.project.discount.services.DiscountService;
import com.example.project.profile.ceoinfo.model.BankAccount;
import com.example.project.profile.ceoinfo.repository.BankAccountRepository;
import com.example.project.ceo_car_seat.model.Seat;
import com.example.project.ceo_car_seat.repository.SeatRepository;
import com.example.project.ceo_food.model.BaseFood;
import com.example.project.ceo_hotel.model.Hotel;
import com.example.project.ceo_personel.model.StaffMember;
import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.ceo_tour.tour.model.TourRealSchedule;
import com.example.project.ceo_tour.tour.repository.TourRealScheduleRepository;
import com.example.project.ceo_tour.tour.repository.TourRepository;
import com.example.project.ceo_tour.tour_car.model.TourVehicle;
import com.example.project.ceo_tour.tour_car.repository.TourVehicleRepository;
import com.example.project.ceo_tour.tour_food.model.TourFood;
import com.example.project.ceo_tour.tour_food.repository.TourFoodRepository;
import com.example.project.ceo_tour.tour_hotel.model.TourHotel;
import com.example.project.ceo_tour.tour_hotel.repository.TourHotelRepository;
import com.example.project.ceo_tour.tour_staff.model.TourStaffMember;
import com.example.project.ceo_tour.tour_staff.repository.TourStaffMemberRepository;
import com.example.project.user_reservation.dto.*;
import com.example.project.user_reservation.repository.ReservationRepository;
import com.example.project.user_reservation.repository.ReservationSeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserTourServiceImpl implements UserTourService {

    private final TourRepository tourRepository;
    private final TourRealScheduleRepository scheduleRepository;
    private final TourHotelRepository tourHotelRepository;
    private final TourFoodRepository tourFoodRepository;
    private final TourVehicleRepository tourVehicleRepository;
    private final TourStaffMemberRepository tourStaffMemberRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationSeatRepository reservationSeatRepository;
    private final SeatRepository seatRepository;
    private final BankAccountRepository bankAccountRepository;
    private final DiscountService discountService;

    @Override
    @Transactional(readOnly = true)
    public List<UserTourDto> getAllAvailableTours() {
        log.debug("Fetching all available tours for users");

        List<Tour> tours = tourRepository.findAllBookableTours();

        return tours.stream()
                .filter(this::hasAvailableCapacity)
                .map(this::toUserTourDto)
                .collect(Collectors.toList());
    }

    private boolean hasAvailableCapacity(Tour tour) {
        int capacity = computeRealCapacity(tour);
        if (capacity <= 0) {
            return true;
        }
        Long confirmedCount = reservationRepository.countConfirmedByTourId(tour.getId());
        return capacity > confirmedCount;
    }

    /**
     * ظرفیت واقعی تور = تعداد صندلی‌های فعال وسایل نقلیه اختصاص‌یافته به تور.
     * (اگر هنوز صندلی‌ای برای تور تولید نشده باشد، از ظرفیت دستی تور استفاده می‌شود)
     */
    private int computeRealCapacity(Tour tour) {
        List<TourVehicle> tourVehicles = tourVehicleRepository.findAllByTourId(tour.getId());
        int realCapacity = tourVehicles.stream()
                .map(TourVehicle::getVehicle)
                .filter(vehicle -> vehicle != null)
                .mapToInt(vehicle -> (int) seatRepository.countActiveByVehicleId(vehicle.getId()))
                .sum();
        if (realCapacity > 0) {
            return realCapacity;
        }
        return tour.getCapacity() != null ? tour.getCapacity() : 0;
    }

    private Tour requireBookableTour(Long tourId) {
        return tourRepository.findBookableById(tourId)
                .orElseThrow(() -> new RuntimeException("تور مورد نظر یافت نشد، غیرفعال است یا تاریخ آن گذشته است"));
    }

    private UserTourDto toUserTourDto(Tour tour) {
        Long confirmedCount = reservationRepository.countConfirmedByTourId(tour.getId());
        int capacity = computeRealCapacity(tour);
        int availableCapacity = capacity <= 0
                ? Integer.MAX_VALUE
                : Math.max(0, capacity - confirmedCount.intValue());

        String baseTourName = "";
        String baseTourCode = "";

        if (tour.getBaseTour() != null) {
            baseTourName = tour.getBaseTour().getTourName() != null ? tour.getBaseTour().getTourName() : "";
            baseTourCode = tour.getBaseTour().getTourCode() != null ? tour.getBaseTour().getTourCode() : "";
        }

        Integer specialPercent = discountService.getActiveSpecialPercent(tour.getId());
        BigDecimal discountedPrice = null;
        if (specialPercent != null && tour.getPrice() != null) {
            discountedPrice = tour.getPrice().multiply(
                    BigDecimal.ONE.subtract(BigDecimal.valueOf(specialPercent)
                            .divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP)))
                    .setScale(0, java.math.RoundingMode.HALF_UP);
        }

        return UserTourDto.builder()
                .id(tour.getId())
                .baseTourName(baseTourName)
                .baseTourCode(baseTourCode)
                .originCityName("")
                .destinationCityName("")
                .departureDate(tour.getDepartureDate())
                .returnDate(tour.getReturnDate())
                .price(tour.getPrice())
                .discountedPrice(discountedPrice)
                .discountPercent(specialPercent)
                .availableCapacity(availableCapacity == Integer.MAX_VALUE ? 999 : availableCapacity)
                .createdByUsername(tour.getCreatedBy() != null ? tour.getCreatedBy().getUsername() : "")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserTourDetailsDto getTourDetails(Long tourId) {
        log.debug("Fetching details for tour: {}", tourId);

        Tour tour = requireBookableTour(tourId);

        // ظرفیت واقعی = تعداد صندلی‌های فعال وسایل نقلیه تور (نه مقدار دستی ظرفیت)
        int capacity = computeRealCapacity(tour);
        Long confirmedCount = reservationRepository.countConfirmedByTourId(tourId);
        int availableCapacity = Math.max(0, capacity - confirmedCount.intValue());

        // برنامه سفر
        List<TourRealSchedule> schedules = scheduleRepository.findAllByTour_IdOrderByOrderIndexAsc(tourId);
        List<UserTourScheduleItemDto> scheduleItems = schedules.stream()
                .map(this::toScheduleItemDto)
                .collect(Collectors.toList());

        // هتل‌های اختصاصی این تور - استفاده از com.example.project.ceo_hotel.dto.HotelDto
        List<com.example.project.ceo_hotel.dto.HotelDto> hotels = tourHotelRepository.findAllByTourId(tourId)
                .stream()
                .map(TourHotel::getBaseHotel)
                .filter(hotel -> hotel != null)
                .map(this::toCeoHotelDto)
                .collect(Collectors.toList());

        // غذاهای اختصاصی این تور
        List<TourFoodDto> foods = tourFoodRepository.findAllByTourId(tourId)
                .stream()
                .map(this::toTourFoodDto)
                .filter(food -> food != null)
                .collect(Collectors.toList());

        // وسایل نقلیه اختصاصی این تور - استفاده از com.example.project.ceo_car.dto.VehicleDto
        List<com.example.project.ceo_car.dto.VehicleDto> vehicles = tourVehicleRepository.findAllByTourId(tourId)
                .stream()
                .map(TourVehicle::getVehicle)
                .filter(vehicle -> vehicle != null)
                .map(this::toCeoVehicleDto)
                .collect(Collectors.toList());

        // کارکنان اختصاصی این تور
        List<StaffMemberDto> staffs = tourStaffMemberRepository.findAllByTour_Id(tourId)
                .stream()
                .map(TourStaffMember::getStaffMember)
                .filter(staff -> staff != null)
                .map(this::toStaffMemberDto)
                .collect(Collectors.toList());

        String baseTourName = "";
        String baseTourCode = "";
        if (tour.getBaseTour() != null) {
            baseTourName = tour.getBaseTour().getTourName() != null ? tour.getBaseTour().getTourName() : "";
            baseTourCode = tour.getBaseTour().getTourCode() != null ? tour.getBaseTour().getTourCode() : "";
        }

        Integer specialPercent = discountService.getActiveSpecialPercent(tour.getId());
        BigDecimal discountedPrice = null;
        if (specialPercent != null && tour.getPrice() != null) {
            discountedPrice = tour.getPrice().multiply(
                    BigDecimal.ONE.subtract(BigDecimal.valueOf(specialPercent)
                            .divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP)))
                    .setScale(0, java.math.RoundingMode.HALF_UP);
        }

        return UserTourDetailsDto.builder()
                .id(tour.getId())
                .baseTourName(baseTourName)
                .baseTourCode(baseTourCode)
                .description(tour.getDescription() != null ? tour.getDescription() : "")
                .departureDate(tour.getDepartureDate())
                .returnDate(tour.getReturnDate())
                .price(tour.getPrice())
                .discountedPrice(discountedPrice)
                .discountPercent(specialPercent)
                .totalCapacity(capacity)
                .availableCapacity(availableCapacity)
                .agencyName(tour.getCreatedBy() != null ? tour.getCreatedBy().getUsername() : "")
                .schedule(scheduleItems)
                .hotels(hotels)
                .foods(foods)
                .vehicles(vehicles)
                .staffs(staffs)
                .build();
    }

    private UserTourScheduleItemDto toScheduleItemDto(TourRealSchedule schedule) {
        String stationType = schedule.getStationCategory() != null ? schedule.getStationCategory().name() : "";

        return UserTourScheduleItemDto.builder()
                .stationId(schedule.getStationId())
                .stationName("")
                .stationCity("")
                .stationType(stationType)
                .orderIndex(schedule.getOrderIndex())
                .scheduleDate(schedule.getScheduleDate())
                .plannedArrivalTime(schedule.getPlannedArrivalTime())
                .finalArrivalTime(schedule.getFinalArrivalTime())
                .build();
    }

    // تبدیل به com.example.project.ceo_hotel.dto.HotelDto
    private com.example.project.ceo_hotel.dto.HotelDto toCeoHotelDto(Hotel hotel) {
        if (hotel == null) return null;
        return com.example.project.ceo_hotel.dto.HotelDto.builder()
                .id(hotel.getId())
                .name(hotel.getName() != null ? hotel.getName() : "")
                .address(hotel.getAddress() != null ? hotel.getAddress() : "")
                .stars(hotel.getStars())
                .city(hotel.getCity() != null ? hotel.getCity() : "")
                .build();
    }

    // تبدیل به com.example.project.ceo_car.dto.VehicleDto
    private com.example.project.ceo_car.dto.VehicleDto toCeoVehicleDto(Vehicle vehicle) {
        if (vehicle == null) return null;
        return com.example.project.ceo_car.dto.VehicleDto.builder()
                .id(vehicle.getId())
                .name(vehicle.getName() != null ? vehicle.getName() : "")
                .manufacturer(vehicle.getManufacturer() != null ? vehicle.getManufacturer() : "")
                .plateNumber(vehicle.getPlateNumber() != null ? vehicle.getPlateNumber() : "")
                .seatCount(vehicle.getSeatCount())
                .build();
    }

    private TourFoodDto toTourFoodDto(TourFood tourFood) {
        if (tourFood == null) return null;
        BaseFood baseFood = tourFood.getBaseFood();
        return TourFoodDto.builder()
                .id(tourFood.getId())
                .foodId(baseFood != null ? baseFood.getId() : null)
                .foodName(baseFood != null && baseFood.getName() != null ? baseFood.getName() : "")
                .foodType(baseFood != null && baseFood.getFoodType() != null ? baseFood.getFoodType().name() : "")
                .serveDay(tourFood.getServeDay() != null ? tourFood.getServeDay() : "")
                .price(tourFood.getPrice())
                .build();
    }

    // تبدیل StaffMember به StaffMemberDto با فیلدهای صحیح
    private StaffMemberDto toStaffMemberDto(StaffMember staffMember) {
        if (staffMember == null) return null;

        String role = "";
        if (staffMember.getPosition() != null) {
            role = staffMember.getPosition().getTitle() != null ?
                    staffMember.getPosition().getTitle() : "";
        }

        return StaffMemberDto.builder()
                .id(staffMember.getId())
                .firstName(staffMember.getFullName() != null ? staffMember.getFullName() : "")
                .lastName("")
                .role(role)
                .phone(staffMember.getPhoneNumber() != null ? staffMember.getPhoneNumber() : "")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatStatusDto> getTourSeatsStatus(Long tourId) {
        log.debug("Fetching seats status for tour: {}", tourId);

        Tour tour = requireBookableTour(tourId);

        // گرفتن صندلی‌های رزرو شده برای این تور
        Set<Long> bookedSeatIds = reservationSeatRepository.findBookedSeatIdsByTourId(tourId);

        // گرفتن وضعیت رزرو برای هر صندلی (PENDING یا CONFIRMED)
        List<Object[]> seatReservationStatuses = reservationSeatRepository.findSeatReservationStatusByTourId(tourId);
        Map<Long, String> seatStatusMap = new HashMap<>();
        for (Object[] row : seatReservationStatuses) {
            Long seatId = (Long) row[0];
            String reservationStatus = ((Enum) row[1]).name();
            // PENDING_PAYMENT و WAITING_FOR_VERIFICATION → PENDING
            // CONFIRMED → CONFIRMED
            if ("CONFIRMED".equals(reservationStatus)) {
                seatStatusMap.put(seatId, "CONFIRMED");
            } else {
                seatStatusMap.put(seatId, "PENDING");
            }
        }

        // گرفتن وسایل نقلیه این تور
        List<TourVehicle> tourVehicles = tourVehicleRepository.findAllByTourId(tourId);

        if (tourVehicles.isEmpty()) {
            return List.of();
        }

        // فرض می‌کنیم هر تور یک وسیله نقلیه دارد
        List<Seat> seats = tourVehicles.stream()
                .map(TourVehicle::getVehicle)
                .filter(vehicle -> vehicle != null)
                .flatMap(vehicle -> seatRepository
                        .findByVehicleIdAndIsActiveTrueOrderBySeatNumberAsc(vehicle.getId())
                        .stream())
                .collect(Collectors.toList());

        // گرفتن صندلی‌های این وسیله نقلیه
        return seats.stream()
                .map(seat -> {
                    Long seatId = seat.getId();
                    boolean isBooked = bookedSeatIds.contains(seatId);
                    String status = isBooked ? seatStatusMap.getOrDefault(seatId, "PENDING") : "AVAILABLE";
                    return SeatStatusDto.builder()
                            .seatId(seatId)
                            .seatNumber(seat.getSeatNumber())
                            .rowNumber(seat.getRowNumber())
                            .position(seat.getPosition())
                            .seatType(seat.getSeatType().name())
                            .isBooked(isBooked)
                            .status(status)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TourPaymentInfoDto getTourPaymentInfo(Long tourId) {
        Tour tour = requireBookableTour(tourId);

        if (tour.getCreatedBy() == null) {
            throw new RuntimeException("اطلاعات آژانس یافت نشد");
        }

        BankAccount bankAccount = bankAccountRepository.findByUserId(tour.getCreatedBy().getId())
                .orElseThrow(() -> new RuntimeException("اطلاعات بانکی آژانس ثبت نشده است"));

        return TourPaymentInfoDto.builder()
                .accountHolderName(bankAccount.getAccountHolderName())
                .bankName(bankAccount.getBankName())
                .cardNumber(bankAccount.getCardNumber())
                .iban(bankAccount.getIban())
                .accountNumber(bankAccount.getAccountNumber())
                .agencyName(tour.getCreatedBy().getUsername())
                .tourPrice(tour.getPrice())
                .build();
    }

}
