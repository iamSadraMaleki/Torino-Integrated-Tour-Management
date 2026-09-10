package com.example.project.ticket.model;

import com.example.project.users.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * تیکت پشتیبانی — توسط مسافر یا مدیر آژانس ثبت می‌شود و ادمین/اپراتور مدیریت می‌کند.
 */
@Entity
@Table(name = "tickets",
        indexes = {
                @Index(name = "idx_ticket_status", columnList = "status"),
                @Index(name = "idx_ticket_priority", columnList = "priority"),
                @Index(name = "idx_ticket_creator", columnList = "creator_id"),
                @Index(name = "idx_ticket_assigned", columnList = "assigned_to_id"),
                @Index(name = "idx_ticket_created", columnList = "created_at")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** شماره سریال تیکت (مثلاً 492081) */
    @Column(name = "serial_number", nullable = false, unique = true, length = 20)
    private String serialNumber;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private TicketStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private TicketPriority priority;

    /** ایجادکننده تیکت (مسافر یا مدیر آژانس) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    /** اپراتور/ادمینی که تیکت به او تخصیص داده شده است */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "close_reason", columnDefinition = "TEXT")
    private String closeReason;

    @Column(name = "closed_by", length = 50)
    private String closedBy;
}
