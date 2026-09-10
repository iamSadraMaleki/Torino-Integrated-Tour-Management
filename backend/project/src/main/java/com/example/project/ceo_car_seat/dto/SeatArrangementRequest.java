package com.example.project.ceo_car_seat.dto;


import com.example.project.ceo_car_seat.model.SeatArrangementPattern;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SeatArrangementRequest {

    @NotNull(message = "الگوی چینش الزامی است")
    private SeatArrangementPattern pattern;

    @Size(max = 100, message = "نام نباید بیشتر از 100 کاراکتر باشد")
    private String name;

    @Size(max = 500, message = "توضیحات نباید بیشتر از 500 کاراکتر باشد")
    private String description;

    private Boolean isDefault;
}
