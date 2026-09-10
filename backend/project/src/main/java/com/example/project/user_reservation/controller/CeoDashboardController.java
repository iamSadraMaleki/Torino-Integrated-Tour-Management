package com.example.project.user_reservation.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.user_reservation.dto.CeoDashboardStatsDto;
import com.example.project.user_reservation.services.CeoDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ceo/dashboard")
@RequiredArgsConstructor
public class CeoDashboardController {

    private final CeoDashboardService ceoDashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<CeoDashboardStatsDto>> getStats() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        var data = ceoDashboardService.getDashboardStats(username);
        return ResponseEntity.ok(ApiResponse.ok("آمار داشبورد", data));
    }
}
