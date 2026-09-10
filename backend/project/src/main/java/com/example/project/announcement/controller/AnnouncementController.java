package com.example.project.announcement.controller;

import com.example.project.announcement.dto.AnnouncementCreateRequest;
import com.example.project.announcement.dto.AnnouncementResponse;
import com.example.project.announcement.services.AnnouncementService;
import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.users.config.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final SecurityUtils securityUtils;

    // ==================== ادمین (مدیریت اطلاعیه‌ها) ====================

    /** ساخت اطلاعیه جدید */
    @PostMapping("/api/admin/announcements")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> create(
            @Valid @RequestBody AnnouncementCreateRequest request) {
        String adminUsername = securityUtils.currentUsername();
        log.info("Admin {} creating announcement", adminUsername);
        AnnouncementResponse data = announcementService.create(adminUsername, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("اطلاعیه با موفقیت ایجاد شد", data));
    }

    /** تاریخچه کامل اطلاعیه‌ها */
    @GetMapping("/api/admin/announcements")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getAll() {
        List<AnnouncementResponse> data = announcementService.getAll();
        return ResponseEntity.ok(ApiResponse.ok("لیست اطلاعیه‌ها", data));
    }

    /** پین/آنپین */
    @PutMapping("/api/admin/announcements/{id}/pin")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> togglePin(@PathVariable Long id) {
        AnnouncementResponse data = announcementService.togglePin(id);
        return ResponseEntity.ok(ApiResponse.ok("وضعیت پین تغییر کرد", data));
    }

    /** فعال/غیرفعال */
    @PutMapping("/api/admin/announcements/{id}/active")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> toggleActive(@PathVariable Long id) {
        AnnouncementResponse data = announcementService.toggleActive(id);
        return ResponseEntity.ok(ApiResponse.ok("وضعیت اطلاعیه تغییر کرد", data));
    }

    /** حذف */
    @DeleteMapping("/api/admin/announcements/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        announcementService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("اطلاعیه حذف شد", null));
    }

    // ==================== کاربران (نمایش اطلاعیه‌های فعال) ====================

    /** اطلاعیه‌های فعال برای کاربر جاری (فیلتر بر اساس مخاطب و شهر) */
    @GetMapping("/api/announcements/active")
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getActive() {
        String username = securityUtils.currentUsername();
        List<AnnouncementResponse> data = announcementService.getActiveForUser(username);
        return ResponseEntity.ok(ApiResponse.ok("اطلاعیه‌های فعال", data));
    }
}
