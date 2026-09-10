package com.example.project.ceo_car_seat.dto;

import com.example.project.ceo_car_seat.model.SeatType;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SeatUpdateRequest {

    private Boolean isActive;

    private SeatType seatType;

    @Size(max = 500, message = "یادداشت نباید بیشتر از 500 کاراکتر باشد")
    private String notes;
}

