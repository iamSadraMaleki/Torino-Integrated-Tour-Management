package com.example.project.profile.verification.dto;


import com.example.project.profile.verification.model.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CeoVerificationDto {
    private Long id;
    private Long userId;
    private String username;
    private String agencyName;
    private String legalName;
    private String ceoName;
    private String registrationNumber;
    private LocalDate licenseExpiryDate;
    private String taxNumber;
    private LocalDate establishmentDate;
    private String companyEmail;
    private String companyPhone;
    private VerificationStatus status;
    private String statusPersian;
    private String message;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private String rejectionReason;
}

