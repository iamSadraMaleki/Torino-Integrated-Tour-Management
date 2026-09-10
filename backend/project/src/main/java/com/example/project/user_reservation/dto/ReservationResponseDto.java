package com.example.project.user_reservation.dto;


import lombok.Builder;
import lombok.Value;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Value
@Builder
public class ReservationResponseDto {
    Long id;
    Long tourId;
    String tourName;
    String tourCode;
    LocalDate departureDate;
    LocalDate returnDate;
    BigDecimal totalPrice;
    Integer passengerCount;
    String status;
    String statusPersian;
    LocalDateTime expiresAt;
    LocalDateTime createdAt;
    List<PassengerDto> passengers;
    Set<Long> seatIds;
    String userUsername;
    String userMobile;
    PaymentProofDto paymentProof;
}