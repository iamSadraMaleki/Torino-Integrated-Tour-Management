package com.example.project.ceo_tour.tour_staff.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TourStaffResponseDTO {

    private Long id;

    private Long tourId;

    private Long staffMemberId;

    private String fullName;

    private BigDecimal paymentAmount;
}
