package com.example.project.tour_chat.model;

import com.example.project.users.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * پیام داخل گفتگوی مسافر و مدیر آژانس (چت مانند)
 */
@Entity
@Table(name = "tour_chat_messages",
        indexes = {
                @Index(name = "idx_tour_chat_msg_conv", columnList = "conversation_id"),
                @Index(name = "idx_tour_chat_msg_created", columnList = "created_at")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id", nullable = false)
    private TourConversation conversation;

    /** فرستنده پیام */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(name = "sender_name", nullable = false, length = 50)
    private String senderName;

    /** USER (مسافر) / AGENCY (مدیر آژانس) */
    @Column(name = "sender_role", nullable = false, length = 20)
    private String senderRole;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    /** پیوست (data URL تصویر) — اختیاری */
    @Column(name = "attachment_url", columnDefinition = "TEXT")
    private String attachmentUrl;

    /** آیا پیام توسط فرستنده ویرایش شده است؟ */
    @Column(name = "is_edited")
    @Builder.Default
    private boolean edited = false;

    /** آیا پیام حذف شده است؟ (حذف نرم برای مانیتورینگ امنیتی) */
    @Column(name = "is_deleted")
    @Builder.Default
    private boolean deleted = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
