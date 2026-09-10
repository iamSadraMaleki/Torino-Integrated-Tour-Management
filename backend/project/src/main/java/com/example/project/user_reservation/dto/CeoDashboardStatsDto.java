package com.example.project.user_reservation.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Value
@Builder
public class CeoDashboardStatsDto {
    int activeTours;
    int pendingApprovals;
    int totalPassengers;
    int confirmedReservations;
    int uniqueCustomers;
    BigDecimal totalRevenue;
}
