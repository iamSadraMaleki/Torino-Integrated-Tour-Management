package com.example.project.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewRequest {

    @NotNull(message = "شناسه تور الزامی است")
    private Long tourId;

    @NotNull(message = "امتیاز الزامی است")
    @Min(value = 1, message = "حداقل امتیاز ۱ است")
    @Max(value = 5, message = "حداکثر امتیاز ۵ است")
    private Integer rating;

    private String comment;
}
