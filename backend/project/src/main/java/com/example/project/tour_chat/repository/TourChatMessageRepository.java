package com.example.project.tour_chat.repository;

import com.example.project.tour_chat.model.TourChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TourChatMessageRepository extends JpaRepository<TourChatMessage, Long> {

    List<TourChatMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    /** همه پیام‌ها برای مانیتورینگ سوپرادمین — جدیدترین اول */
    List<TourChatMessage> findAllByOrderByCreatedAtDesc();

    long countByConversationId(Long conversationId);

    /** پیام‌های خوانده‌نشده بعد از آخرین زمان خواندن — برای اینباکس */
    long countByConversationIdAndCreatedAtAfter(Long conversationId, LocalDateTime after);
}
