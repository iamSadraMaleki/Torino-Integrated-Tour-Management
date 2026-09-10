package com.example.project.announcement.dto;

import com.example.project.announcement.model.AnnouncementAudience;
import com.example.project.announcement.model.AnnouncementPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementCreateRequest {

    @NotBlank(message = "عنوان اطلاعیه الزامی است")
    @Size(max = 200, message = "عنوان حداکثر ۲۰۰ کاراکتر")
    private String title;

    @NotBlank(message = "متن اطلاعیه الزامی است")
    private String content;

    @NotNull(message = "اولویت اطلاعیه الزامی است")
    private AnnouncementPriority priority;

    @NotNull(message = "مخاطب اطلاعیه الزامی است")
    private AnnouncementAudience audience;

    /** فقط وقتی audience=CITY است الزامی می‌شود */
    private String targetCity;

    private LocalDateTime expiresAt;

    private Boolean isPinned;
}
