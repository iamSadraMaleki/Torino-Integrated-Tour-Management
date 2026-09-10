package com.example.project.ticket.dto;

import com.example.project.ticket.model.TicketPriority;
import com.example.project.ticket.model.TicketStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponse {

    private Long id;
    private String serialNumber;
    private String title;
    private String content;
    private TicketStatus status;
    private String statusPersian;
    private TicketPriority priority;
    private String priorityPersian;

    /** نقش ایجادکننده: USER / AGENCY */
    private String creatorRole;
    private String creatorRolePersian;
    private String creatorUsername;

    private String assignedToUsername;
    private String assignedToRolePersian;

    private LocalDateTime createdAt;
    private LocalDateTime closedAt;
    private String closeReason;
    private String closedBy;

    private LocalDateTime lastMessageAt;
    private String lastMessagePreview;
    private long messageCount;
}
