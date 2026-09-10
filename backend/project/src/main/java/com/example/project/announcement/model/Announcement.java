package com.example.project.announcement.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "announcements",
        indexes = {
                @Index(name = "idx_announcement_status", columnList = "is_active"),
                @Index(name = "idx_announcement_expires", columnList = "expires_at"),
                @Index(name = "idx_announcement_pinned", columnList = "is_pinned"),
                @Index(name = "idx_announcement_priority", columnList = "priority")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private AnnouncementPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "audience", nullable = false, length = 20)
    private AnnouncementAudience audience;

    /** فقط وقتی audience=CITY باشد استفاده می‌شود */
    @Column(name = "target_city", length = 100)
    private String targetCity;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "is_pinned", nullable = false)
    @Builder.Default
    private Boolean isPinned = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_by", nullable = false, length = 50)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
