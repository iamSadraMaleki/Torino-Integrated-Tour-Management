package com.example.project.finance.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommissionConfigRequest {

    @NotNull(message = "درصد کمیسیون الزامی است")
    @Min(value = 0, message = "کمیسیون نمیتواند منفی باشد")
    @Max(value = 100, message = "کمیسیون حداکثر ۱۰۰ درصد است")
    private Integer commissionPercent;
}
