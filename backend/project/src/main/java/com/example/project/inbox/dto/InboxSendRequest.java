package com.example.project.inbox.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * ارسال پیام خصوصی از سمت سوپرادمین/ادمین به یک کاربر
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InboxSendRequest {

    @NotBlank(message = "نام کاربری گیرنده الزامی است")
    private String recipientUsername;

    @NotBlank(message = "عنوان پیام الزامی است")
    @Size(max = 200, message = "عنوان نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد")
    private String title;

    @NotBlank(message = "متن پیام الزامی است")
    @Size(max = 4000, message = "متن پیام نمی‌تواند بیشتر از ۴۰۰۰ کاراکتر باشد")
    private String content;
}
