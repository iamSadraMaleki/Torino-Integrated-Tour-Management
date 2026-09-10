package com.example.project.ceo_car_seat.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SeatGenerateRequest {

    @NotNull(message = "شناسه ماشین الزامی است")
    private Long vehicleId;

    private Long arrangementId; // اختیاری - اگه نباشه از Default استفاده می‌کنه
}
