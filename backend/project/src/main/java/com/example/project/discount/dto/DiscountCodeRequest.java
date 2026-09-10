package com.example.project.discount.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class DiscountCodeRequest {

    @NotBlank(message = "کد تخفیف الزامی است")
    @Size(max = 50, message = "کد نمی‌تواند بیشتر از ۵۰ کاراکتر باشد")
    private String code;

    @Size(max = 200, message = "عنوان نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد")
    private String title;

    @NotNull(message = "درصد تخفیف الزامی است")
    @Min(value = 1, message = "حداقل تخفیف ۱ درصد است")
    @Max(value = 99, message = "حداکثر تخفیف ۹۹ درصد است")
    private Integer discountPercent;

    /** حداکثر تعداد استفاده — خالی یعنی نامحدود */
    private Integer maxUses;

    private LocalDateTime expiresAt;

    /** اگر تنظیم باشد فقط این کاربر می‌تواند استفاده کند و کد به اینباکس او ارسال می‌شود */
    private String forUserUsername;
}
