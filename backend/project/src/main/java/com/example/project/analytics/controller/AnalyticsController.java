package com.example.project.analytics.controller;

import com.example.project.analytics.dto.AdminAnalyticsResponse;
import com.example.project.analytics.dto.CeoAnalyticsResponse;
import com.example.project.analytics.services.AnalyticsService;
import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.users.config.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * تحلیل هوشمند داشبوردها — نمودارهای تحلیلی برای مدیر آژانس و سوپرادمین
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final SecurityUtils securityUtils;

    /** تحلیل هوشمند داشبورد مدیر آژانس */
    @GetMapping("/ceo/dashboard/analytics")
    public ResponseEntity<ApiResponse<CeoAnalyticsResponse>> getCeoAnalytics() {
        String username = securityUtils.currentUsername();
        log.info("CEO analytics requested by: {}", username);
        return ResponseEntity.ok(ApiResponse.ok("تحلیل هوشمند داشبورد",
                analyticsService.getCeoAnalytics(username)));
    }

    /** تحلیل هوشمند داشبورد سوپرادمین (کل پلتفرم) */
    @GetMapping("/admin/dashboard/analytics")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<ApiResponse<AdminAnalyticsResponse>> getAdminAnalytics() {
        log.info("Admin analytics requested by: {}", securityUtils.currentUsername());
        return ResponseEntity.ok(ApiResponse.ok("تحلیل هوشمند پلتفرم",
                analyticsService.getAdminAnalytics()));
    }
}
