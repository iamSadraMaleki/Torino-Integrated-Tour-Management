package com.example.project.phonebook.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhonebookContactRequest {

    @NotBlank(message = "نام و نام خانوادگی الزامی است")
    @Size(max = 100, message = "نام حداکثر ۱۰۰ کاراکتر")
    private String fullName;

    @NotBlank(message = "شماره تلفن الزامی است")
    @Size(max = 30, message = "شماره تلفن حداکثر ۳۰ کاراکتر")
    private String phone;

    private Long jobId;

    @Size(max = 255, message = "یادداشت حداکثر ۲۵۵ کاراکتر")
    private String notes;
}
