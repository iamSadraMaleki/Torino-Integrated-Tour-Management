package com.example.project.discount.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class DiscountCodeDto {
    private Long id;
    private String code;
    private String title;
    private Integer discountPercent;
    private Integer maxUses;
    private Integer usedCount;
    private LocalDateTime expiresAt;
    private Boolean isActive;
    private String forUserUsername;
    private String createdByUsername;
    private String createdByRole;
    private LocalDateTime createdAt;
}
