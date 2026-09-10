package com.example.project.user_reservation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.List;

@Data
public class CancelRequestDto {

    @NotBlank(message = "شماره کارت مقصد برای برگشت پول الزامی است")
    @Pattern(regexp = "^\\d{16}$", message = "شماره کارت باید 16 رقم باشد")
    private String targetCardNumber;

    // در صورت خالی بودن = لغو کل رزرو
    // در صورت پر بودن = لغو انتخابی فقط این مسافران
    private List<Long> passengerIds;
}
