package com.example.project.finance.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Value
@Builder
public class SettlementRequestDto {

    Long id;
    String agencyUsername;
    String agencyName;
    BigDecimal requestedAmount;
    int commissionPercent;
    BigDecimal commissionAmount;
    BigDecimal netAmount;
    String status;
    String statusPersian;
    String rejectionReason;
    String processedBy;
    LocalDateTime requestedAt;
    LocalDateTime processedAt;
}
