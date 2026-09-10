package com.example.project.tour_chat.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * پاسخ گفتگوی مسافر و مدیر آژانس
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourConversationResponse {

    private Long id;

    // اطلاعات تور
    private Long tourId;
    private String tourName;
    private String tourCode;
    private LocalDate departureDate;
    private LocalDate returnDate;

    // طرفین گفتگو
    private String passengerUsername;
    private String passengerMobile;
    private String ceoUsername;

    // آخرین وضعیت
    private LocalDateTime lastMessageAt;
    private String lastMessagePreview;
    private long messageCount;

    /** تعداد پیام‌های نخوانده برای کاربر جاری — برای اینباکس */
    private long unreadCount;
}
