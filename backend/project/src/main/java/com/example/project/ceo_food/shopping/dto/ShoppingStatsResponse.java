package com.example.project.ceo_food.shopping.dto;

import lombok.*;

import java.math.BigDecimal;

/**
 * آمار لیست خرید — تعداد در انتظار / خریداری‌شده / لغوشده
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShoppingStatsResponse {

    private long pendingCount;
    private long purchasedCount;
    private long cancelledCount;
    private BigDecimal purchasedQuantity;
}
