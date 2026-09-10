package com.example.project.user_reservation.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Value
@Builder
public class TourPaymentInfoDto {
    String accountHolderName;
    String bankName;
    String cardNumber;
    String iban;
    String accountNumber;
    String agencyName;
    BigDecimal tourPrice;
}
