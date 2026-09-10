package com.example.project.phonebook.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhonebookContactResponse {

    private Long id;
    private String fullName;
    private String phone;
    private Long jobId;
    private String jobName;
    private String notes;
    private LocalDateTime createdAt;

    // اطلاعات مالک - فقط برای مانیتورینگ سوپرادمین
    private String ownerUsername;
    private String ownerCity;
    private String ownerRoles;
}
