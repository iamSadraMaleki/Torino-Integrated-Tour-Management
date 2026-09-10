package com.example.project.ticket.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketMessageResponse {

    private Long id;
    private String content;
    private String senderUsername;
    /** USER / AGENCY / ADMIN */
    private String senderRole;
    private String senderRolePersian;
    /** پیام از طرف پشتیبانی (ادمین) است؟ */
    @JsonProperty("isSupport")
    private boolean isSupport;
    private String attachmentUrl;
    private LocalDateTime createdAt;
}
