package com.example.project.profile.verification.dto;



import com.example.project.profile.verification.model.CeoVerification;
import org.springframework.stereotype.Component;

@Component
public class CeoVerificationMapper {

    public CeoVerificationDto toDto(CeoVerification verification) {
        if (verification == null) {
            return null;
        }

        return CeoVerificationDto.builder()
                .id(verification.getId())
                .userId(verification.getUser().getId())
                .username(verification.getUser().getUsername())
                .agencyName(verification.getAgencyName())
                .legalName(verification.getLegalName())
                .ceoName(verification.getCeoName())
                .registrationNumber(verification.getRegistrationNumber())
                .licenseExpiryDate(verification.getLicenseExpiryDate())
                .taxNumber(verification.getTaxNumber())
                .establishmentDate(verification.getEstablishmentDate())
                .companyEmail(verification.getCompanyEmail())
                .companyPhone(verification.getCompanyPhone())
                .status(verification.getStatus())
                .statusPersian(verification.getStatus().getPersianName())
                .submittedAt(verification.getSubmittedAt())
                .reviewedAt(verification.getReviewedAt())
                .rejectionReason(verification.getRejectionReason())
                .build();
    }

    public CeoVerificationResponse toResponse(CeoVerification verification, String message) {
        if (verification == null) {
            return null;
        }

        return CeoVerificationResponse.builder()
                .id(verification.getId())
                .status(verification.getStatus())
                .statusPersian(verification.getStatus().getPersianName())
                .message(message)
                .submittedAt(verification.getSubmittedAt())
                .reviewedAt(verification.getReviewedAt())
                .rejectionReason(verification.getRejectionReason())
                .build();
    }
}

