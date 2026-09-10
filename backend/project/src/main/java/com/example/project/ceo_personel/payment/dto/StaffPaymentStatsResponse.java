package com.example.project.ceo_personel.payment.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * آمار پرداخت‌های کارکنان — مجموع، به تفکیک کارمند و به تفکیک ماه
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffPaymentStatsResponse {

    private BigDecimal totalPaid;
    private BigDecimal totalSalary;
    private BigDecimal totalBonus;
    private long paymentCount;
    private long salaryCount;
    private long bonusCount;

    /** به تفکیک هر کارمند */
    private List<PerStaff> perStaff;

    /** به تفکیک ماه */
    private List<PerMonth> perMonth;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PerStaff {
        private Long staffMemberId;
        private String staffName;
        private BigDecimal total;
        private BigDecimal salaryTotal;
        private BigDecimal bonusTotal;
        private long paymentCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PerMonth {
        private String month; // YYYY-MM
        private BigDecimal total;
        private long paymentCount;
    }
}
