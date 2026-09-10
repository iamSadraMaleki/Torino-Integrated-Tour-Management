package com.example.project.profile.ceoinfo.services;


import com.example.project.profile.ceoinfo.dto.AuditLogDto;
import com.example.project.users.model.User;

import java.util.List;

public interface AuditLogService {

    void logChange(User user, String entityType, Long entityId,
                   String fieldName, String oldValue, String newValue,
                   String action, String ipAddress);

    List<AuditLogDto> getEntityHistory(String entityType, Long entityId);

    List<AuditLogDto> getUserHistory(Long userId);
}
