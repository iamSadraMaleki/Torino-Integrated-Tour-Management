package com.example.project.tour_chat.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * شروع گفتگو با مدیر آژانس برای یک تور (ایجاد یا بازیابی گفتگوی موجود)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourChatCreateRequest {

    @NotNull(message = "شناسه تور الزامی است")
    private Long tourId;
}
