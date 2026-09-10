package com.example.project.profile.verification.Controller;


import com.example.project.profile.verification.dto.CeoVerificationDto;
import com.example.project.profile.verification.dto.CeoVerificationRequest;
import com.example.project.profile.verification.dto.CeoVerificationResponse;
import com.example.project.profile.verification.services.CeoVerificationService;
import com.example.project.users.dto.UserDto;
import com.example.project.users.service.UserService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/ceo-verification")
@RequiredArgsConstructor
public class CeoVerificationController {

    private final CeoVerificationService verificationService;
    private static final Logger logger = LoggerFactory.getLogger(CeoVerificationController.class);

    @PostMapping("/submit")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<CeoVerificationResponse> submitVerification(@Valid @RequestBody CeoVerificationRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} submitting verification request", username);

        CeoVerificationResponse response = verificationService.submitVerification(username, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    @GetMapping("/status")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<CeoVerificationDto> getVerificationStatus() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} checking verification status", username);
        CeoVerificationDto dto = verificationService.getVerificationStatus(username);
        return ResponseEntity.ok(dto);
    }


    @GetMapping("/pending")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<List<CeoVerificationDto>> getPendingVerifications() {
        logger.info("SUPERADMIN fetching pending verifications");
        List<CeoVerificationDto> pendingList = verificationService.getPendingVerifications();
        return ResponseEntity.ok(pendingList);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<List<CeoVerificationDto>> getAllVerifications() {
        logger.info("SUPERADMIN fetching all verifications");
        List<CeoVerificationDto> allVerifications = verificationService.getAllVerifications();
        return ResponseEntity.ok(allVerifications);
    }


    @PutMapping("/approve/{id}")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<CeoVerificationResponse> approveVerification(@PathVariable Long id) {
        String adminUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("SUPERADMIN {} approving verification ID: {}", adminUsername, id);
        CeoVerificationResponse response = verificationService.approveVerification(id, adminUsername);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/reject/{id}")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<CeoVerificationResponse> rejectVerification(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String adminUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        String rejectionReason = payload.getOrDefault("rejectionReason", "دلیلی ذکر نشده است");
        logger.info("SUPERADMIN {} rejecting verification ID: {}", adminUsername, id);
        CeoVerificationResponse response = verificationService.rejectVerification(id, adminUsername, rejectionReason);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/is-verified")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<Map<String, Boolean>> checkIfVerified() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isVerified = verificationService.isUserVerified(username);

        return ResponseEntity.ok(Map.of("verified", isVerified));
    }

    @GetMapping("/user-verification-status")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<Map<String, Object>> getUserVerificationStatus() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} checking user verification status", username);

        Map<String, Object> status = verificationService.getUserVerificationStatus(username);
        return ResponseEntity.ok(status);
    }
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    @GetMapping("/statuses")
    public ResponseEntity<Map<String, Object>> getAllStatuses() {
        Map<String, Object> statuses = Map.of(
                "NOT_VERIFIED", Map.of(
                        "value", "NOT_VERIFIED",
                        "persianName", "احراز نشده",
                        "description", "کاربر هنوز درخواست احراز هویت ثبت نکرده"
                ),
                "PENDING", Map.of(
                        "value", "PENDING", 
                        "persianName", "در انتظار بررسی",
                        "description", "درخواست ثبت شده و در انتظار بررسی ادمین"
                ),
                "VERIFIED", Map.of(
                        "value", "VERIFIED",
                        "persianName", "تایید شد", 
                        "description", "درخواست تایید شده"
                ),
                "REJECTED", Map.of(
                        "value", "REJECTED",
                        "persianName", "رد شد",
                        "description", "درخواست رد شده"
                )
        );

        return ResponseEntity.ok(statuses);
    }


    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> getVerificationStatistics() {
        logger.info("SUPERADMIN requesting verification statistics");

        Map<String, Object> statistics = verificationService.getVerificationStatistics();
        return ResponseEntity.ok(statistics);
    }


    @GetMapping("/user-verification-status/{username}")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> getUserVerificationStatusByAdmin(@PathVariable String username) {
        logger.info("SUPERADMIN checking verification status for user: {}", username);

        Map<String, Object> status = verificationService.getUserVerificationStatus(username);
        return ResponseEntity.ok(status);
    }


    @PutMapping("/update-user-verification-status/{username}")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> updateUserVerificationStatus(
            @PathVariable String username,
            @RequestBody Map<String, String> payload) {
        String adminUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        String newStatus = payload.get("status");
        logger.info("SUPERADMIN {} updating verification status for user {} to {}", adminUsername, username, newStatus);
        Map<String, Object> result = verificationService.updateUserVerificationStatus(username, newStatus, adminUsername);
        return ResponseEntity.ok(result);
    }
}
