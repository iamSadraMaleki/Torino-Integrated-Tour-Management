package com.example.project.discount.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TourSpecialDiscountRequest {

    @NotNull(message = "شناسه تور الزامی است")
    private Long tourId;

    @NotNull(message = "درصد تخفیف الزامی است")
    @Min(value = 1, message = "حداقل تخفیف ۱ درصد است")
    @Max(value = 99, message = "حداکثر تخفیف ۹۹ درصد است")
    private Integer discountPercent;

    @NotNull(message = "زمان انقضا الزامی است")
    private LocalDateTime expiresAt;
}
