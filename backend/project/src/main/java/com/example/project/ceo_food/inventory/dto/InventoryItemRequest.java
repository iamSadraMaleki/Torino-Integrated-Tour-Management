package com.example.project.ceo_food.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * ثبت/ویرایش قلم انبار
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemRequest {

    @NotBlank(message = "نام قلم الزامی است")
    @Size(max = 150, message = "نام نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد")
    private String name;

    @NotNull(message = "دسته‌بندی الزامی است")
    private String category; // FOOD / DRINK / DESSERT / OTHER

    @Size(max = 20, message = "واحد نمی‌تواند بیشتر از ۲۰ کاراکتر باشد")
    private String unit;

    @NotNull(message = "موجودی الزامی است")
    @DecimalMin(value = "0", message = "موجودی نمی‌تواند منفی باشد")
    private BigDecimal quantity;

    @DecimalMin(value = "0", message = "حداقل موجودی نمی‌تواند منفی باشد")
    private BigDecimal minQuantity;

    @Size(max = 2000, message = "توضیحات نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد")
    private String description;
}
