package com.example.project.profile.ceoinfo.controller;


import com.example.project.profile.ceoinfo.dto.AuditLogDto;
import com.example.project.profile.ceoinfo.dto.CeoDataResponse;
import com.example.project.profile.ceoinfo.dto.CeoProfileDto;
import com.example.project.profile.ceoinfo.dto.CeoProfileRequest;
import com.example.project.profile.ceoinfo.services.AuditLogService;
import com.example.project.profile.ceoinfo.services.CeoProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ceo/profile")
@RequiredArgsConstructor
public class CeoProfileController {

    private final CeoProfileService profileService;
    private final AuditLogService auditLogService;
    private static final Logger logger = LoggerFactory.getLogger(CeoProfileController.class);


    @PostMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<CeoDataResponse> createProfile(
            @Valid @RequestBody CeoProfileRequest request,
            HttpServletRequest httpRequest) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} creating profile", username);

        CeoProfileDto profileDto = profileService.createProfile(username, request, httpRequest);

        CeoDataResponse response = CeoDataResponse.builder()
                .success(true)
                .message("اطلاعات مدیرعامل با موفقیت ثبت شد")
                .data(profileDto)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<CeoDataResponse> updateProfile(
            @Valid @RequestBody CeoProfileRequest request,
            HttpServletRequest httpRequest) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} updating profile", username);

        CeoProfileDto profileDto = profileService.updateProfile(username, request, httpRequest);

        CeoDataResponse response = CeoDataResponse.builder()
                .success(true)
                .message("اطلاعات مدیرعامل با موفقیت ویرایش شد")
                .data(profileDto)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<CeoDataResponse> getProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching profile", username);

        CeoProfileDto profileDto = profileService.getProfile(username);

        CeoDataResponse response = CeoDataResponse.builder()
                .success(true)
                .message("اطلاعات با موفقیت بازیابی شد")
                .data(profileDto)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<CeoDataResponse> getProfileHistory() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching profile history", username);

        CeoProfileDto profileDto = profileService.getProfile(username);
        List<AuditLogDto> history = auditLogService.getEntityHistory("CeoProfile", profileDto.getId());

        CeoDataResponse response = CeoDataResponse.builder()
                .success(true)
                .message("تاریخچه تغییرات با موفقیت بازیابی شد")
                .data(history)
                .build();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<CeoDataResponse> deleteProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} deleting profile", username);

        profileService.deleteProfile(username);

        CeoDataResponse response = CeoDataResponse.builder()
                .success(true)
                .message("اطلاعات مدیرعامل با موفقیت حذف شد")
                .data(null)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{profileId}")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<CeoDataResponse> getProfileById(@PathVariable Long profileId) {
        logger.info("SUPERADMIN fetching profile with id: {}", profileId);

        CeoProfileDto profileDto = profileService.getProfileById(profileId);

        CeoDataResponse response = CeoDataResponse.builder()
                .success(true)
                .message("اطلاعات با موفقیت بازیابی شد")
                .data(profileDto)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{profileId}/history")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<CeoDataResponse> getProfileHistoryById(@PathVariable Long profileId) {
        logger.info("SUPERADMIN fetching profile history with id: {}", profileId);

        List<AuditLogDto> history = auditLogService.getEntityHistory("CeoProfile", profileId);

        CeoDataResponse response = CeoDataResponse.builder()
                .success(true)
                .message("تاریخچه تغییرات با موفقیت بازیابی شد")
                .data(history)
                .build();

        return ResponseEntity.ok(response);
    }
}

