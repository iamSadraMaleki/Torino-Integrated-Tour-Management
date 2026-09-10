package com.example.project.user_reservation.services;

import com.example.project.user_reservation.dto.CeoDashboardStatsDto;

public interface CeoDashboardService {
    CeoDashboardStatsDto getDashboardStats(String username);
}
