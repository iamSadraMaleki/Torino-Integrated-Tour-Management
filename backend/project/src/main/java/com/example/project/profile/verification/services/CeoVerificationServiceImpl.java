package com.example.project.profile.verification.services;

import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import com.example.project.profile.verification.dto.*;
import com.example.project.profile.verification.model.CeoVerification;
import com.example.project.profile.verification.model.VerificationStatus;
import com.example.project.profile.verification.repository.CeoVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CeoVerificationServiceImpl implements CeoVerificationService {

    private final CeoVerificationRepository verificationRepository;
    private final UserRepository userRepository;
    private final CeoVerificationMapper verificationMapper;
    private static final Logger logger = LoggerFactory.getLogger(CeoVerificationServiceImpl.class);

    @Override
    @Transactional
    public CeoVerificationResponse submitVerification(String username, CeoVerificationRequest request) {
        logger.info("Submitting verification for user: {}", username);


        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));


        boolean isCeo = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ROLE_CEO"));

        if (!isCeo) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "فقط کاربران با نقش CEO می‌توانند درخواست احراز هویت ثبت کنند");
        }

        CeoVerification existingVerification = verificationRepository.findByUserId(user.getId()).orElse(null);
        if (existingVerification != null && existingVerification.getStatus().isFinalStatus()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "شما قبلاً درخواست احراز هویت ثبت کرده‌اید و وضعیت نهایی است");
        }

        CeoVerification verification;
        if (existingVerification != null) {
            verification = existingVerification;
            verification.setAgencyName(request.getAgencyName());
            verification.setLegalName(request.getLegalName());
            verification.setCeoName(request.getCeoName());
            verification.setRegistrationNumber(request.getRegistrationNumber());
            verification.setLicenseExpiryDate(request.getLicenseExpiryDate());
            verification.setTaxNumber(request.getTaxNumber());
            verification.setEstablishmentDate(request.getEstablishmentDate());
            verification.setCompanyEmail(request.getCompanyEmail());
            verification.setCompanyPhone(request.getCompanyPhone());
            verification.setStatus(VerificationStatus.PENDING);
            verification.setSubmittedAt(LocalDateTime.now());
            verification.setReviewedAt(null);
            verification.setReviewedBy(null);
            verification.setRejectionReason(null);
        } else {
            verification = CeoVerification.builder()
                    .user(user)
                    .agencyName(request.getAgencyName())
                    .legalName(request.getLegalName())
                    .ceoName(request.getCeoName())
                    .registrationNumber(request.getRegistrationNumber())
                    .licenseExpiryDate(request.getLicenseExpiryDate())
                    .taxNumber(request.getTaxNumber())
                    .establishmentDate(request.getEstablishmentDate())
                    .companyEmail(request.getCompanyEmail())
                    .companyPhone(request.getCompanyPhone())
                    .status(VerificationStatus.PENDING)
                    .build();
        }

        CeoVerification saved = verificationRepository.save(verification);
        logger.info("Verification submitted successfully for user: {}", username);

        return verificationMapper.toResponse(saved, "درخواست احراز هویت با موفقیت ثبت شد و در انتظار بررسی است");
    }

    @Override
    @Transactional(readOnly = true)
    public CeoVerificationDto getVerificationStatus(String username) {
        logger.info("Getting verification status for user: {}", username);

        CeoVerification verification = verificationRepository.findByUsername(username)
                .orElse(null);

        if (verification == null) {
            return CeoVerificationDto.builder()
                    .status(VerificationStatus.NOT_VERIFIED)
                    .statusPersian(VerificationStatus.NOT_VERIFIED.getPersianName())
                    .message("شما هنوز درخواست احراز هویت ثبت نکرده‌اید")
                    .build();
        }

        return verificationMapper.toDto(verification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CeoVerificationDto> getPendingVerifications() {
        logger.info("Fetching all pending verifications");

        List<CeoVerification> pendingList = verificationRepository.findPendingVerifications(VerificationStatus.PENDING);

        return pendingList.stream()
                .map(verificationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CeoVerificationDto> getAllVerifications() {
        logger.info("Fetching all verifications");

        List<CeoVerification> allVerifications = verificationRepository.findAllWithUser();

        return allVerifications.stream()
                .map(verificationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CeoVerificationResponse approveVerification(Long verificationId, String adminUsername) {
        logger.info("Approving verification ID: {} by admin: {}", verificationId, adminUsername);

        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ادمین پیدا نشد"));

        CeoVerification verification = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "درخواست احراز هویت پیدا نشد"));

        if (verification.getStatus() != VerificationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "این درخواست قبلاً بررسی شده است");
        }


        verification.setStatus(VerificationStatus.VERIFIED);
        verification.setReviewedAt(LocalDateTime.now());
        verification.setReviewedBy(admin.getId());


        User user = verification.getUser();
        user.setVerificationStatus(VerificationStatus.VERIFIED);
        userRepository.save(user);

        CeoVerification updated = verificationRepository.save(verification);
        logger.info("Verification approved successfully for user ID: {} - User verification status updated to VERIFIED", verification.getUser().getId());

        return verificationMapper.toResponse(updated, "درخواست احراز هویت با موفقیت تایید شد و وضعیت کاربر بروزرسانی شد");
    }

    @Override
    @Transactional
    public CeoVerificationResponse rejectVerification(Long verificationId, String adminUsername, String rejectionReason) {
        logger.info("Rejecting verification ID: {} by admin: {}", verificationId, adminUsername);


        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ادمین پیدا نشد"));


        CeoVerification verification = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "درخواست احراز هویت پیدا نشد"));


        if (verification.getStatus() != VerificationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "این درخواست قبلاً بررسی شده است");
        }


        verification.setStatus(VerificationStatus.REJECTED);
        verification.setReviewedAt(LocalDateTime.now());
        verification.setReviewedBy(admin.getId());
        verification.setRejectionReason(rejectionReason);


        User user = verification.getUser();
        user.setVerificationStatus(VerificationStatus.REJECTED);
        userRepository.save(user);

        CeoVerification updated = verificationRepository.save(verification);
        logger.info("Verification rejected for user ID: {} - User verification status updated to REJECTED", verification.getUser().getId());

        return verificationMapper.toResponse(updated, "درخواست احراز هویت رد شد و وضعیت کاربر بروزرسانی شد");
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isUserVerified(String username) {
        return verificationRepository.findByUsername(username)
                .map(verification -> verification.getStatus() == VerificationStatus.VERIFIED)
                .orElse(false);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getUserVerificationStatus(String username) {
        logger.info("Getting user verification status for: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        return Map.of(
                "userId", user.getId(),
                "username", user.getUsername(),
                "verificationStatus", user.getVerificationStatus(),
                "verificationStatusPersian", user.getVerificationStatus().getPersianName(),
                "isVerified", user.getVerificationStatus() == VerificationStatus.VERIFIED,
                "isPending", user.getVerificationStatus() == VerificationStatus.PENDING,
                "isRejected", user.getVerificationStatus() == VerificationStatus.REJECTED,
                "isNotVerified", user.getVerificationStatus() == VerificationStatus.NOT_VERIFIED
        );
    }

    @Override
    @Transactional
    public Map<String, Object> updateUserVerificationStatus(String username, String newStatus, String adminUsername) {
        logger.info("Updating verification status for user {} to {} by admin {}", username, newStatus, adminUsername);


        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));


        userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ادمین پیدا نشد"));


        VerificationStatus status;
        try {
            status = VerificationStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "وضعیت نامعتبر: " + newStatus);
        }

        VerificationStatus oldStatus = user.getVerificationStatus();

        user.setVerificationStatus(status);
        userRepository.save(user);

        logger.info("User {} verification status updated from {} to {} by admin {}", 
                username, oldStatus, status, adminUsername);

        return Map.of(
                "success", true,
                "message", "وضعیت احراز هویت کاربر با موفقیت بروزرسانی شد",
                "userId", user.getId(),
                "username", user.getUsername(),
                "oldStatus", oldStatus,
                "oldStatusPersian", oldStatus.getPersianName(),
                "newStatus", status,
                "newStatusPersian", status.getPersianName(),
                "updatedBy", adminUsername,
                "updatedAt", LocalDateTime.now()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getVerificationStatistics() {
        logger.info("Calculating verification statistics");


        long totalCeoUsers = userRepository.countByRoles_Name("ROLE_CEO");
        

        long pendingCount = verificationRepository.countByStatus(VerificationStatus.PENDING);
        

        long verifiedCount = verificationRepository.countByStatus(VerificationStatus.VERIFIED);
        

        long rejectedCount = verificationRepository.countByStatus(VerificationStatus.REJECTED);
        

        long notVerifiedCount = totalCeoUsers - (pendingCount + verifiedCount + rejectedCount);

        return Map.of(
                "totalCeoUsers", totalCeoUsers,
                "notVerified", Map.of(
                        "count", notVerifiedCount,
                        "percentage", totalCeoUsers > 0 ? Math.round((double) notVerifiedCount / totalCeoUsers * 100) : 0
                ),
                "pending", Map.of(
                        "count", pendingCount,
                        "percentage", totalCeoUsers > 0 ? Math.round((double) pendingCount / totalCeoUsers * 100) : 0
                ),
                "verified", Map.of(
                        "count", verifiedCount,
                        "percentage", totalCeoUsers > 0 ? Math.round((double) verifiedCount / totalCeoUsers * 100) : 0
                ),
                "rejected", Map.of(
                        "count", rejectedCount,
                        "percentage", totalCeoUsers > 0 ? Math.round((double) rejectedCount / totalCeoUsers * 100) : 0
                )
        );
    }
}
