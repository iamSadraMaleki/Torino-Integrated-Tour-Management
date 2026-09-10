package com.example.project.ceo_food.inventory.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * قلم انبار
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemResponse {

    private Long id;
    private String name;
    private String category;
    private String categoryPersian;
    private String unit;
    private BigDecimal quantity;
    private BigDecimal minQuantity;
    private boolean lowStock;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
