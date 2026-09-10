package com.example.project.ceo_car.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VehicleFeatureRequest {

    @NotBlank(message = "نام ویژگی الزامی است")
    @Size(min = 2, max = 100, message = "نام ویژگی باید بین 2 تا 100 کاراکتر باشد")
    private String name;

    @Size(max = 500, message = "توضیحات نباید بیشتر از 500 کاراکتر باشد")
    private String description;

    @Size(max = 50, message = "آیکون نباید بیشتر از 50 کاراکتر باشد")
    private String icon;

    private Boolean isActive = true;
}

