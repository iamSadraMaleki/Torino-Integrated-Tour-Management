package com.example.project.announcement.dto;

import com.example.project.announcement.model.AnnouncementAudience;
import com.example.project.announcement.model.AnnouncementPriority;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementResponse {

    private Long id;
    private String title;
    private String content;
    private AnnouncementPriority priority;
    private String priorityPersian;
    private AnnouncementAudience audience;
    private String audiencePersian;
    private String targetCity;
    private LocalDateTime expiresAt;
    private Boolean isPinned;
    private Boolean isActive;
    private String createdBy;
    private LocalDateTime createdAt;
    private Boolean isExpired;   // آیا تاریخ انقضا گذشته؟
}
