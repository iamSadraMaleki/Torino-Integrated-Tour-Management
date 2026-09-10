package com.example.project.profile.ceoinfo.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CeoProfileRequest {

    @NotBlank(message = "نام کامل الزامی است")
    @Size(min = 3, max = 100, message = "نام کامل باید بین 3 تا 100 کاراکتر باشد")
    private String fullName;

    @NotBlank(message = "کد ملی الزامی است")
    @Pattern(regexp = "^\\d{10}$", message = "کد ملی باید 10 رقم باشد")
    private String nationalCode;

    @NotNull(message = "تاریخ تولد الزامی است")
    private LocalDate birthDate;

    @NotBlank(message = "شماره تماس الزامی است")
    @Pattern(regexp = "^09\\d{9}$", message = "شماره تماس باید با 09 شروع شود و 11 رقم باشد")
    private String phoneNumber;
}

