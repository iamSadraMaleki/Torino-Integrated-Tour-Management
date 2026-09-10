package com.example.project.ceo_personel.dto;



import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PositionRequest {

    @NotBlank(message = "عنوان سمت الزامی است")
    @Size(min = 2, max = 100, message = "عنوان سمت باید بین 2 تا 100 کاراکتر باشد")
    private String title;

    @Size(max = 500, message = "توضیحات نباید بیشتر از 500 کاراکتر باشد")
    private String description;

    private Boolean isActive = true;
}
