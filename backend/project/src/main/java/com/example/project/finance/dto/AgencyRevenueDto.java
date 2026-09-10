package com.example.project.finance.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

/** گزارش درآمد هر آژانس + محاسبه کمیسیون پلتفرم */
@Value
@Builder
public class AgencyRevenueDto {

    Long agencyId;
    String agencyUsername;
    String agencyName;
    BigDecimal totalRevenue;
    long totalReservations;
    long totalPassengers;
    int commissionPercent;
    BigDecimal commissionAmount;
    BigDecimal netAmount;
    BigDecimal settledAmount;
    BigDecimal availableAmount;
}
