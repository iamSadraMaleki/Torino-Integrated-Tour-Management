package com.example.project.tour_chat.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ردیف مانیتورینگ چت برای پنل سوپرادمین/ادمین — جدول: متن پیام، فرستنده، گیرنده، تاریخ
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminTourChatMessageResponse {

    private Long id;

    private Long conversationId;

    // اطلاعات تور
    private Long tourId;
    private String tourName;
    private String tourCode;

    private String content;

    // فرستنده
    private Long senderId;
    private String senderUsername;
    private String senderRole;
    private String senderRolePersian;

    // گیرنده
    private Long receiverId;
    private String receiverUsername;
    private String receiverRole;
    private String receiverRolePersian;

    private String attachmentUrl;

    private boolean edited;
    private boolean deleted;

    /** اخطارهای صادرشده برای این پیام */
    private List<ChatWarningResponse> warnings;
    private long warningCount;

    private LocalDateTime createdAt;
}
