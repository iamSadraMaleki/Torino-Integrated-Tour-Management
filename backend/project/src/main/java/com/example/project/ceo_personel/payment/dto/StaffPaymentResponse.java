package com.example.project.ceo_personel.payment.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * پرداخت ثبت‌شده به کارمند
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffPaymentResponse {

    private Long id;
    private Long staffMemberId;
    private String staffName;
    private String positionTitle;
    private BigDecimal amount;
    private String paymentType;      // SALARY / BONUS
    private String paymentTypePersian;
    private String title;
    private String description;
    private LocalDate paymentDate;
    private String createdBy;
    private LocalDateTime createdAt;
}
