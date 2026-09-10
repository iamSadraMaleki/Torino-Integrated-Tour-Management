package com.example.project.ceo_personel.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * ثبت پرداخت (حقوق/پاداش) به یک کارمند
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffPaymentRequest {

    @NotNull(message = "کارمند الزامی است")
    private Long staffMemberId;

    @NotNull(message = "مبلغ الزامی است")
    @DecimalMin(value = "0", message = "مبلغ نمی‌تواند منفی باشد")
    private BigDecimal amount;

    @NotNull(message = "نوع پرداخت الزامی است")
    private String paymentType; // SALARY / BONUS

    @NotBlank(message = "عنوان پرداخت الزامی است")
    @Size(max = 200, message = "عنوان نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد")
    private String title;

    @Size(max = 2000, message = "توضیحات نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد")
    private String description;

    private LocalDate paymentDate;
}
