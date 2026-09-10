package com.example.project.inbox.dto;

import com.example.project.inbox.model.InboxMessageType;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;

/**
 * تاریخچه پیام‌های اینباکس — برای پنل سوپرادمین (بدونیم به کی چه چیزی ارسال شده)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InboxHistoryResponse {

    private Long id;

    /** گیرنده پیام */
    private String recipientUsername;

    /** نقش گیرنده — ROLE_USER / ROLE_CEO / ... */
    private String recipientRole;

    private String recipientRolePersian;

    /** فرستنده — SYSTEM / ADMIN / SUPERADMIN / نام کاربری */
    private String senderUsername;

    private String senderRole;

    private String senderRolePersian;

    private InboxMessageType type;

    private String title;

    private String content;

    private Long referenceId;

    @JsonProperty("isRead")
    private boolean read;

    private LocalDateTime createdAt;
}
