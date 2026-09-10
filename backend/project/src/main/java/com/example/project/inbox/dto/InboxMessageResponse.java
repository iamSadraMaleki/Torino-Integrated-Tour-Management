package com.example.project.inbox.dto;

import com.example.project.inbox.model.InboxMessageType;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;

/**
 * پاسخ پیام اینباکس
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InboxMessageResponse {

    private Long id;

    private String senderUsername;

    /** SYSTEM / ADMIN / SUPERADMIN */
    private String senderRole;

    private String senderRolePersian;

    private InboxMessageType type;

    private String title;

    private String content;

    /** شناسه مرتبط (مثلاً شناسه اخطار) */
    private Long referenceId;

    @JsonProperty("isRead")
    private boolean read;

    private LocalDateTime createdAt;
}
