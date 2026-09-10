package com.example.project.inbox.repository;

import com.example.project.inbox.model.InboxMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InboxMessageRepository extends JpaRepository<InboxMessage, Long> {

    List<InboxMessage> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    long countByRecipientId(Long recipientId);

    long countByRecipientIdAndReadFalse(Long recipientId);

    Optional<InboxMessage> findByIdAndRecipientId(Long id, Long recipientId);

    /** همه پیام‌ها (تاریخچه ارسال برای پنل ادمین) — جدیدترین اول */
    List<InboxMessage> findAllByOrderByCreatedAtDesc();
}
