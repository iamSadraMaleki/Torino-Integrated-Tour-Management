package com.example.project.user_reservation.dto;



import lombok.Builder;
import lombok.Value;
import java.math.BigDecimal;

@Value
@Builder
public class CancelReservationResponseDto {
    Long reservationId;
    String status;
    String statusPersian;
    BigDecimal refundAmount;
    String message;
}