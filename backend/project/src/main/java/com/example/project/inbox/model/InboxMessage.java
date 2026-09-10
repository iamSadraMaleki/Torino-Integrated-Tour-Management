package com.example.project.inbox.model;

import com.example.project.users.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * پیام صندوق دریافت (اینباکس) — اخطارها، پیام‌های خصوصی ادمین و اطلاع‌رسانی‌های سیستمی
 */
@Entity
@Table(name = "inbox_messages",
        indexes = {
                @Index(name = "idx_inbox_recipient", columnList = "recipient_id"),
                @Index(name = "idx_inbox_recipient_created", columnList = "recipient_id, created_at"),
                @Index(name = "idx_inbox_read", columnList = "recipient_id, is_read")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InboxMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** گیرنده پیام */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    /** نام فرستنده — برای پیام‌های سیستمی «سیستم» */
    @Column(name = "sender_username", nullable = false, length = 50)
    private String senderUsername;

    /** نقش فرستنده — SYSTEM / ADMIN / SUPERADMIN (فقط برای نمایش) */
    @Column(name = "sender_role", nullable = false, length = 20)
    private String senderRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private InboxMessageType type;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    /** شناسه مرتبط (مثلاً شناسه اخطار) — اختیاری */
    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "is_read")
    @Builder.Default
    private boolean read = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
