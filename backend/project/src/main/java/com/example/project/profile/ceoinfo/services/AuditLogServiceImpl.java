package com.example.project.profile.ceoinfo.services;


import com.example.project.profile.ceoinfo.dto.AuditLogDto;
import com.example.project.profile.ceoinfo.mapper.AuditLogMapper;
import com.example.project.profile.ceoinfo.model.AuditLog;
import com.example.project.profile.ceoinfo.repository.AuditLogRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;
    private static final Logger logger = LoggerFactory.getLogger(AuditLogServiceImpl.class);

    @Override
    @Transactional
    public void logChange(User user, String entityType, Long entityId,
                          String fieldName, String oldValue, String newValue,
                          String action, String ipAddress) {

        logger.info("Logging change for entity: {} id: {} by user: {}",
                entityType, entityId, user.getUsername());

        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .entityType(entityType)
                .entityId(entityId)
                .fieldName(fieldName)
                .oldValue(oldValue)
                .newValue(newValue)
                .action(action)
                .ipAddress(ipAddress)
                .build();

        auditLogRepository.save(auditLog);
        logger.info("Audit log saved successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogDto> getEntityHistory(String entityType, Long entityId) {
        logger.info("Fetching history for entity: {} id: {}", entityType, entityId);

        return auditLogRepository
                .findByEntityTypeAndEntityIdOrderByChangedAtDesc(entityType, entityId)
                .stream()
                .map(auditLogMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogDto> getUserHistory(Long userId) {
        logger.info("Fetching history for user id: {}", userId);

        return auditLogRepository
                .findByUserIdOrderByChangedAtDesc(userId)
                .stream()
                .map(auditLogMapper::toDto)
                .collect(Collectors.toList());
    }
}
