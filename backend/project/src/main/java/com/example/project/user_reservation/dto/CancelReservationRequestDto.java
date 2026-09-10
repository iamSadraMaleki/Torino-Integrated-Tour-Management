package com.example.project.user_reservation.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CancelReservationRequestDto {

    @NotBlank(message = "شماره کارت مقصد برای برگشت پول الزامی است")
    @Pattern(regexp = "^\\d{16}$", message = "شماره کارت باید 16 رقم باشد")
    private String targetCardNumber;
}