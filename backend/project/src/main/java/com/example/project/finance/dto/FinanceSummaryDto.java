package com.example.project.finance.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Value
@Builder
public class FinanceSummaryDto {

    long totalTransactions;
    BigDecimal totalAmount;
    BigDecimal totalCommission;
    long pendingSettlements;
    long approvedSettlements;
}
