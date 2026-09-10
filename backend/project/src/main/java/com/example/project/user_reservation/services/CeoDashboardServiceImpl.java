package com.example.project.user_reservation.services;

import com.example.project.ceo_tour.tour.model.TourStatus;
import com.example.project.ceo_tour.tour.repository.TourRepository;
import com.example.project.user_reservation.dto.CeoDashboardStatsDto;
import com.example.project.user_reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CeoDashboardServiceImpl implements CeoDashboardService {

    private final TourRepository tourRepository;
    private final ReservationRepository reservationRepository;

    @Override
    @Transactional(readOnly = true)
    public CeoDashboardStatsDto getDashboardStats(String username) {
        int activeTours = (int) tourRepository.findAllByCreatedByUsernameOrderByDepartureDateDesc(username).stream()
                .filter(t -> t.getStatus() == TourStatus.ACTIVE)
                .count();

        int pendingApprovals = reservationRepository.findAllWaitingForVerificationByCeoUsername(username).size();
        long totalPassengers = reservationRepository.sumConfirmedPassengersByCeoUsername(username);
        long confirmedReservations = reservationRepository.countConfirmedByCeoUsername(username);
        long uniqueCustomers = reservationRepository.countUniqueCustomersByCeoUsername(username);
        BigDecimal totalRevenue = reservationRepository.sumConfirmedRevenueByCeoUsername(username);

        return CeoDashboardStatsDto.builder()
                .activeTours(activeTours)
                .pendingApprovals(pendingApprovals)
                .totalPassengers((int) totalPassengers)
                .confirmedReservations((int) confirmedReservations)
                .uniqueCustomers((int) uniqueCustomers)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .build();
    }
}
