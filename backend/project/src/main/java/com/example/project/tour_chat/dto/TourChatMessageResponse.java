package com.example.project.tour_chat.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;

/**
 * پاسخ پیام چت — isAgency نشان‌دهنده پیام مدیر آژانس است (رنگ‌آمیزی حباب)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourChatMessageResponse {

    private Long id;

    private String content;

    private Long senderId;

    private String senderUsername;

    /** USER / AGENCY */
    private String senderRole;

    private String senderRolePersian;

    /** true اگر فرستنده مدیر آژانس باشد */
    @JsonProperty("isAgency")
    private boolean isAgency;

    /** گیرنده پیام (طرف مقابل در گفتگو) — برای مانیتورینگ */
    private Long receiverId;
    private String receiverUsername;
    private String receiverRole;
    private String receiverRolePersian;

    private String attachmentUrl;

    /** آیا پیام ویرایش شده است؟ */
    @JsonProperty("isEdited")
    private boolean edited;

    /** آیا پیام (نرم) حذف شده است؟ */
    @JsonProperty("isDeleted")
    private boolean deleted;

    private LocalDateTime createdAt;
}
