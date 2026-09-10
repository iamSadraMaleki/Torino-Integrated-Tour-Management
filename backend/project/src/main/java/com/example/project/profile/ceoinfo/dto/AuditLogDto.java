package com.example.project.profile.ceoinfo.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {
    private Long id;
    private Long userId;
    private String username;
    private String entityType;
    private Long entityId;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private String action;
    private LocalDateTime changedAt;
    private String ipAddress;
}

