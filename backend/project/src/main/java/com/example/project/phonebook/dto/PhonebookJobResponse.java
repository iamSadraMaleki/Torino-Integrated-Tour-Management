package com.example.project.phonebook.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhonebookJobResponse {

    private Long id;
    private String name;
    private String description;
    private long contactCount;
    private LocalDateTime createdAt;
    private String ownerUsername;
}
