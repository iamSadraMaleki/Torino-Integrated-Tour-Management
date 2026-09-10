package com.example.project.user_reservation.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class PaymentProofDto {
    String sourceCardNumber;
    String destinationCardNumber;
    String receiptImageUrl;
    LocalDateTime createdAt;
}
