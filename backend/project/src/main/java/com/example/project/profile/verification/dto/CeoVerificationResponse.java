package com.example.project.profile.verification.dto;

import com.example.project.profile.verification.model.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CeoVerificationResponse {
    private Long id;
    private VerificationStatus status;
    private String statusPersian;
    private String message;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private String rejectionReason;
}
