package com.example.project.phonebook.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhonebookJobRequest {

    @NotBlank(message = "نام سمت الزامی است")
    @Size(max = 100, message = "نام سمت حداکثر ۱۰۰ کاراکتر")
    private String name;

    @Size(max = 255, message = "توضیحات حداکثر ۲۵۵ کاراکتر")
    private String description;
}
