package com.example.project.user_reservation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class PaymentProofRequestDto {

    @NotBlank(message = "شماره کارت مبدأ الزامی است")
    @Pattern(regexp = "^\\d{16}$", message = "شماره کارت باید 16 رقم باشد")
    private String sourceCardNumber;

    @NotBlank(message = "تصویر رسید الزامی است")
    private String receiptImageUrl;
}