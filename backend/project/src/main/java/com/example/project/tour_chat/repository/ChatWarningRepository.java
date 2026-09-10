package com.example.project.tour_chat.repository;

import com.example.project.tour_chat.model.ChatWarning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatWarningRepository extends JpaRepository<ChatWarning, Long> {

    List<ChatWarning> findByMessageIdOrderByCreatedAtDesc(Long messageId);

    List<ChatWarning> findByWarnedUserIdOrderByCreatedAtDesc(Long warnedUserId);

    long countByMessageId(Long messageId);

    long countByWarnedUserId(Long warnedUserId);

    void deleteByWarnedUserId(Long warnedUserId);
}
