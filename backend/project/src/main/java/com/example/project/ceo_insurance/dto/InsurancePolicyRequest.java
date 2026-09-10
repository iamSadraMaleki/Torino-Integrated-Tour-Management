package com.example.project.ceo_insurance.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * ثبت/ویرایش بیمه‌نامه سفر
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsurancePolicyRequest {

    @NotBlank(message = "نام بیمه‌نامه الزامی است")
    @Size(max = 150, message = "نام نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد")
    private String name;

    @NotNull(message = "نوع بیمه الزامی است")
    private String insuranceType; // TRAVEL / HEALTH / ACCIDENT / OTHER

    @NotNull(message = "مبلغ پوشش الزامی است")
    @DecimalMin(value = "0", message = "مبلغ پوشش نمی‌تواند منفی باشد")
    private BigDecimal coverageAmount;

    @NotNull(message = "هزینه بیمه الزامی است")
    @DecimalMin(value = "0", message = "هزینه بیمه نمی‌تواند منفی باشد")
    private BigDecimal premium;

    @Size(max = 2000, message = "توضیحات نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد")
    private String description;
}
