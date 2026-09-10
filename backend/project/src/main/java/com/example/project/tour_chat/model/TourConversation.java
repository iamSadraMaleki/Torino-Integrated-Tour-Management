package com.example.project.tour_chat.model;

import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.users.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * گفتگوی بین مسافر و مدیر آژانس (برگزارکننده تور) — قبل یا بعد از رزرو
 * برای هر (تور، مسافر) فقط یک گفتگو وجود دارد.
 */
@Entity
@Table(name = "tour_conversations",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_tour_conversation_tour_passenger",
                        columnNames = {"tour_id", "passenger_id"})
        },
        indexes = {
                @Index(name = "idx_tour_conv_tour", columnList = "tour_id"),
                @Index(name = "idx_tour_conv_passenger", columnList = "passenger_id"),
                @Index(name = "idx_tour_conv_ceo", columnList = "tour_ceo_id"),
                @Index(name = "idx_tour_conv_last_msg", columnList = "last_message_at")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** تور مورد گفتگو */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    /** مسافر (کاربری که با آژانس گفتگو می‌کند) */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "passenger_id", nullable = false)
    private User passenger;

    /** مدیر آژانس برگزارکننده تور (برای ایندکس و جستجوی سریع سمت CEO) */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tour_ceo_id", nullable = false)
    private User tourCeo;

    /** زمان آخرین پیام — برای مرتب‌سازی لیست گفتگوها */
    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    /** آخرین زمان خواندن گفتگو توسط مسافر — برای شمارنده پیام‌های نخوانده (اینباکس) */
    @Column(name = "passenger_last_read_at")
    private LocalDateTime passengerLastReadAt;

    /** آخرین زمان خواندن گفتگو توسط مدیر آژانس — برای شمارنده پیام‌های نخوانده (اینباکس) */
    @Column(name = "ceo_last_read_at")
    private LocalDateTime ceoLastReadAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
