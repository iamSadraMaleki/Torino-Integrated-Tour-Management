package com.example.project.user_reservation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerifyPaymentRequestDto {

    @NotNull(message = "شناسه رزرو الزامی است")
    private Long reservationId;

    private String rejectionReason;
}