package com.example.project.profile.ceoinfo.mapper;


import com.example.project.profile.ceoinfo.dto.AuditLogDto;
import com.example.project.profile.ceoinfo.model.AuditLog;
import org.springframework.stereotype.Component;

@Component
public class AuditLogMapper {

    public AuditLogDto toDto(AuditLog auditLog) {
        if (auditLog == null) {
            return null;
        }

        return AuditLogDto.builder()
                .id(auditLog.getId())
                .userId(auditLog.getUser().getId())
                .username(auditLog.getUser().getUsername())
                .entityType(auditLog.getEntityType())
                .entityId(auditLog.getEntityId())
                .fieldName(auditLog.getFieldName())
                .oldValue(auditLog.getOldValue())
                .newValue(auditLog.getNewValue())
                .action(auditLog.getAction())
                .changedAt(auditLog.getChangedAt())
                .ipAddress(auditLog.getIpAddress())
                .build();
    }
}
