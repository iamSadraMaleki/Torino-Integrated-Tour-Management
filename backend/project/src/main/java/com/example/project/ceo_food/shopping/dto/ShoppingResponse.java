package com.example.project.ceo_food.shopping.dto;

import lombok.*;

/**
 * رپر پاسخ استاندارد { success, message, data }
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShoppingResponse {
    private boolean success;
    private String message;
    private Object data;
}
