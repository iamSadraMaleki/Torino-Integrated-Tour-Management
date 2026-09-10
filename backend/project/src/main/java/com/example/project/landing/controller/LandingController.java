package com.example.project.landing.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.landing.services.LandingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * محتوای صفحه معرفی سیستم (لندینگ) — خواندن عمومی، ویرایش توسط سوپرادمین/ادمین
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class LandingController {

    private final LandingService landingService;

    /** دریافت محتوای صفحه معرفی — عمومی (بدون نیاز به لاگین) */
    @GetMapping("/api/landing")
    public ResponseEntity<ApiResponse<Map<String, String>>> getContent() {
        return ResponseEntity.ok(ApiResponse.ok("محتوای صفحه معرفی",
                landingService.getContent()));
    }

    /** به‌روزرسانی محتوای صفحه معرفی */
    @PutMapping("/api/admin/landing")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> update(@RequestBody Map<String, String> content) {
        Map<String, String> updated = landingService.updateContent(content);
        return ResponseEntity.ok(ApiResponse.ok("محتوای صفحه معرفی به‌روزرسانی شد", updated));
    }

    /** بازنشانی محتوای صفحه معرفی به مقادیر پیش‌فرض */
    @PostMapping("/api/admin/landing/restore-defaults")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> restoreDefaults() {
        Map<String, String> restored = landingService.restoreDefaults();
        return ResponseEntity.ok(ApiResponse.ok("محتوای صفحه معرفی به حالت پیش‌فرض بازگشت", restored));
    }
}
