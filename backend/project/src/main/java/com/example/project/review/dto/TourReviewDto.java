package com.example.project.review.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class TourReviewDto {
    private Long id;
    private Long tourId;
    private String tourName;
    private String tourCode;
    private Integer rating;
    private String comment;
    private String userUsername;
    private String userMobile;
    private String agencyUsername;
    private LocalDateTime createdAt;
}
