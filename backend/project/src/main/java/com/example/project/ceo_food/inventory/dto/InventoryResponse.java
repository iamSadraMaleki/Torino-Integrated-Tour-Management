package com.example.project.ceo_food.inventory.dto;

import lombok.*;

/**
 * رپر پاسخ استاندارد { success, message, data }
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponse {
    private boolean success;
    private String message;
    private Object data;
}
