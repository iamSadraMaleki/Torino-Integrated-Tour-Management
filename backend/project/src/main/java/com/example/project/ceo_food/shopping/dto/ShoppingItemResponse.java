package com.example.project.ceo_food.shopping.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * قلم لیست خرید
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShoppingItemResponse {

    private Long id;
    private String name;
    private BigDecimal quantity;
    private String unit;
    private String status;          // PENDING / PURCHASED / CANCELLED
    private String statusPersian;
    private String note;
    private Long inventoryItemId;
    private String inventoryItemName;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime purchasedAt;
}
