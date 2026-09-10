package com.example.project.ceo_food.shopping.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * ثبت قلم لیست خرید
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShoppingItemRequest {

    @NotBlank(message = "نام قلم الزامی است")
    @Size(max = 150, message = "نام نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد")
    private String name;

    @NotNull(message = "مقدار الزامی است")
    @DecimalMin(value = "0.01", message = "مقدار باید بزرگتر از صفر باشد")
    private BigDecimal quantity;

    @Size(max = 20, message = "واحد نمی‌تواند بیشتر از ۲۰ کاراکتر باشد")
    private String unit;

    @Size(max = 2000, message = "توضیحات نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد")
    private String note;

    /** لینک اختیاری به قلم انبار */
    private Long inventoryItemId;
}
