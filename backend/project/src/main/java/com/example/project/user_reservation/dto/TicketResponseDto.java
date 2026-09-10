package com.example.project.user_reservation.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * داده‌های بلیط گرافیکی تور (مثل بلیط اتوبوس/قطار)
 */
@Value
@Builder
public class TicketResponseDto {

    Long reservationId;
    String tourName;
    String tourCode;
    String originCity;
    String destinationCity;
    LocalDate departureDate;
    LocalDate returnDate;
    String agencyName;
    String status;
    String statusPersian;
    Integer passengerCount;
    BigDecimal totalPrice;
    String customerName;
    String customerMobile;
    List<TicketPassengerDto> passengers;
}
