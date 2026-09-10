package com.example.project.tour_chat.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * پاسخ اخطار صادرشده برای پیام نامرتبط
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatWarningResponse {

    private Long id;

    private Long messageId;

    /** کاربری که اخطار برای او صادر شده (فرستنده پیام) */
    private Long warnedUserId;
    private String warnedUsername;

    /** نقش کاربر اخطارشده (USER / AGENCY) */
    private String warnedRole;
    private String warnedRolePersian;

    private String reason;

    /** نام ادمین صادرکننده */
    private String issuedBy;

    private LocalDateTime createdAt;
}
