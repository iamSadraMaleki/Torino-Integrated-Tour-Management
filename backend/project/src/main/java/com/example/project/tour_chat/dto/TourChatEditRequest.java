package com.example.project.tour_chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * ویرایش پیام در گفتگو
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourChatEditRequest {

    @NotBlank(message = "متن پیام نمی‌تواند خالی باشد")
    @Size(max = 4000, message = "پیام نمی‌تواند بیشتر از ۴۰۰۰ کاراکتر باشد")
    private String content;

    /** پیوست (data URL تصویر) — اختیاری */
    private String attachmentUrl;
}
