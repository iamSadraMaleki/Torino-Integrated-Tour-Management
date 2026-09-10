package com.example.project.wishlist.services;

import com.example.project.ceo_car_seat.repository.SeatRepository;
import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.ceo_tour.tour.repository.TourRepository;
import com.example.project.ceo_tour.tour_car.model.TourVehicle;
import com.example.project.ceo_tour.tour_car.repository.TourVehicleRepository;
import com.example.project.user_reservation.repository.ReservationRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import com.example.project.wishlist.dto.WishlistItemDto;
import com.example.project.wishlist.model.WishlistItem;
import com.example.project.wishlist.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final TourVehicleRepository tourVehicleRepository;
    private final SeatRepository seatRepository;

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemDto> getMyWishlist(Long userId) {
        return wishlistItemRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WishlistItemDto add(Long userId, Long tourId) {
        if (wishlistItemRepository.existsByUserIdAndTourId(userId, tourId)) {
            // قبلاً اضافه شده — فقط همین مورد را برگردان
            WishlistItem existing = wishlistItemRepository.findByUserIdAndTourId(userId, tourId)
                    .orElseThrow(() -> new RuntimeException("خطا در دریافت مورد علاقه"));
            return toDto(existing);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("کاربر یافت نشد"));
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("تور یافت نشد"));

        WishlistItem item = WishlistItem.builder()
                .user(user)
                .tour(tour)
                .build();
        item = wishlistItemRepository.save(item);
        return toDto(item);
    }

    @Override
    @Transactional
    public void remove(Long userId, Long tourId) {
        wishlistItemRepository.deleteByUserIdAndTourId(userId, tourId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isInWishlist(Long userId, Long tourId) {
        return wishlistItemRepository.existsByUserIdAndTourId(userId, tourId);
    }

    private WishlistItemDto toDto(WishlistItem item) {
        Tour tour = item.getTour();
        String baseTourName = "";
        String baseTourCode = "";
        if (tour.getBaseTour() != null) {
            baseTourName = tour.getBaseTour().getTourName() != null ? tour.getBaseTour().getTourName() : "";
            baseTourCode = tour.getBaseTour().getTourCode() != null ? tour.getBaseTour().getTourCode() : "";
        }

        // ظرفیت واقعی = صندلی‌های فعال وسایل نقلیه تور (در غیر این صورت ظرفیت دستی)
        int capacity = computeRealCapacity(tour);
        Long confirmedCount = reservationRepository.countConfirmedByTourId(tour.getId());
        int availableCapacity = capacity <= 0
                ? 999
                : Math.max(0, capacity - confirmedCount.intValue());

        return WishlistItemDto.builder()
                .id(item.getId())
                .tourId(tour.getId())
                .baseTourName(baseTourName)
                .baseTourCode(baseTourCode)
                .departureDate(tour.getDepartureDate())
                .returnDate(tour.getReturnDate())
                .price(tour.getPrice())
                .availableCapacity(availableCapacity)
                .createdByUsername(tour.getCreatedBy() != null ? tour.getCreatedBy().getUsername() : "")
                .createdAt(item.getCreatedAt())
                .build();
    }

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
}
