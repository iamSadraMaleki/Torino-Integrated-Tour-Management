package com.example.project.profile.ceoinfo.repository;


import com.example.project.profile.ceoinfo.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByEntityTypeAndEntityIdOrderByChangedAtDesc(String entityType, Long entityId);

    List<AuditLog> findByUserIdOrderByChangedAtDesc(Long userId);

    @Query("SELECT al FROM AuditLog al WHERE al.entityType = :entityType AND al.entityId = :entityId ORDER BY al.changedAt DESC")
    Page<AuditLog> findHistoryByEntity(@Param("entityType") String entityType,
                                       @Param("entityId") Long entityId,
                                       Pageable pageable);
}

