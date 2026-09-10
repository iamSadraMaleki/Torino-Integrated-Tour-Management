package com.example.project.ceo_policy.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * بند لغو — هر سیاست می‌تواند چندین بند داشته باشد.
 */
@Data
public class CancellationPolicyClauseDto {

    private Long id;

    @NotNull(message = "ساعت قبل از حرکت الزامی است")
    @Min(value = 0, message = "ساعت قبل از حرکت نمی‌تواند منفی باشد")
    @Max(value = 720, message = "حداکثر 720 ساعت (30 روز) قبل از حرکت")
    private Integer hoursBeforeDeparture;

    @NotNull(message = "درصد بازگشت الزامی است")
    @DecimalMin(value = "0.0", message = "درصد بازگشت حداقل 0 است")
    @DecimalMax(value = "100.0", message = "درصد بازگشت حداکثر 100 است")
    private BigDecimal refundPercentage;
}
