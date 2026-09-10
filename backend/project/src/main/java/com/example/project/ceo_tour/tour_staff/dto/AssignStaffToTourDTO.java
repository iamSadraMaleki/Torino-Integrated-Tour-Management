package com.example.project.ceo_tour.tour_staff.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AssignStaffToTourDTO {

    private Long tourId;
    private Long staffMemberId;
    private BigDecimal paymentAmount;
}