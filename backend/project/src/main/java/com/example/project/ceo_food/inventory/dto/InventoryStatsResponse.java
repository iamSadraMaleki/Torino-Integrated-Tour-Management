package com.example.project.ceo_food.inventory.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * آمار انبار — تعداد اقلام، کمبودها، به تفکیک دسته‌بندی
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryStatsResponse {

    private long totalItems;
    private long lowStockCount;
    private BigDecimal totalQuantity;

    @Builder.Default
    private List<CategoryCount> byCategory = List.of();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryCount {
        private String category;
        private String categoryPersian;
        private long count;
    }
}
