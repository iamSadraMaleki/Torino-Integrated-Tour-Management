package com.example.project.ceo_policy.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
public class CancellationPolicyResponse {
    Long id;
    String policyName;
    String description;
    /** بندهای لغو سیاست */
    List<CancellationPolicyClauseDto> clauses;
    /** فیلد قدیمی — سازگاری با نسخه‌های قبلی */
    Integer hoursBeforeDeparture;
    /** فیلد قدیمی — سازگاری با نسخه‌های قبلی */
    BigDecimal refundPercentage;
    Boolean isDefault;
    Boolean isActive;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}