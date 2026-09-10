package com.example.project.user_reservation.dto;

import lombok.Builder;
import lombok.Value;

/**
 * مسافر داخل بلیط — با شماره صندلی
 */
@Value
@Builder
public class TicketPassengerDto {

    String firstName;
    String lastName;
    String nationalCode;
    String mobile;
    Integer seatNumber;
}
