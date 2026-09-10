package com.example.project.tour_chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * صدور اخطار توسط سوپرادمین/ادمین برای پیام نامرتبط
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatWarningRequest {

    @NotNull(message = "شناسه پیام الزامی است")
    private Long messageId;

    @NotBlank(message = "دلیل اخطار الزامی است")
    @Size(max = 2000, message = "دلیل اخطار نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد")
    private String reason;
}
