package com.example.project.finance.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class CommissionConfigDto {

    Long id;
    Long agencyId;
    String agencyUsername;
    String agencyName;
    int commissionPercent;
    String updatedBy;
    LocalDateTime updatedAt;
}
