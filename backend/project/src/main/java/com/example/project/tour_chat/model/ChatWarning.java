package com.example.project.tour_chat.model;

import com.example.project.users.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * اخطار صادرشده توسط سوپرادمین/ادمین برای پیام نامرتبط در چت مسافر و مدیر آژانس
 */
@Entity
@Table(name = "chat_warnings",
        indexes = {
                @Index(name = "idx_chat_warning_message", columnList = "message_id"),
                @Index(name = "idx_chat_warning_user", columnList = "warned_user_id"),
                @Index(name = "idx_chat_warning_created", columnList = "created_at")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatWarning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** پیام نامرتبط */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "message_id", nullable = false)
    private TourChatMessage message;

    /** کاربری که اخطار برای او صادر شده (فرستنده پیام) */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "warned_user_id", nullable = false)
    private User warnedUser;

    /** دلیل اخطار */
    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    /** نام ادمین صادرکننده */
    @Column(name = "issued_by", nullable = false, length = 50)
    private String issuedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
