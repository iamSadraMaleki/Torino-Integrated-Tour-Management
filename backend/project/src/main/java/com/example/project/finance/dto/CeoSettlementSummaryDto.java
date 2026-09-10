package com.example.project.finance.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Value
@Builder
public class CeoSettlementSummaryDto {

    BigDecimal totalRevenue;
    int commissionPercent;
    BigDecimal commissionAmount;
    BigDecimal netAmount;
    BigDecimal settledAmount;
    BigDecimal availableAmount;
    long pendingRequests;
}
