package com.example.project.ticket.model;

import com.example.project.users.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * پیام داخل تیکت (مکالمه چت مانند)
 */
@Entity
@Table(name = "ticket_messages",
        indexes = {
                @Index(name = "idx_ticket_msg_ticket", columnList = "ticket_id"),
                @Index(name = "idx_ticket_msg_created", columnList = "created_at")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    /** فرستنده پیام */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(name = "sender_name", nullable = false, length = 50)
    private String senderName;

    /** USER / AGENCY / ADMIN */
    @Column(name = "sender_role", nullable = false, length = 20)
    private String senderRole;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    /** پیوست (data URL تصویر) — optional */
    @Column(name = "attachment_url", columnDefinition = "TEXT")
    private String attachmentUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
