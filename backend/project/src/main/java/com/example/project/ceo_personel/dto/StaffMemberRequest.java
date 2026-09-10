package com.example.project.ceo_personel.dto;


import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StaffMemberRequest {

    @NotNull(message = "شناسه سمت الزامی است")
    private Long positionId;

    @NotBlank(message = "نام و نام خانوادگی الزامی است")
    @Size(min = 3, max = 100, message = "نام و نام خانوادگی باید بین 3 تا 100 کاراکتر باشد")
    private String fullName;

    @NotBlank(message = "کد ملی الزامی است")
    @Pattern(regexp = "^\\d{10}$", message = "کد ملی باید 10 رقم باشد")
    private String nationalCode;

    @NotBlank(message = "نام پدر الزامی است")
    @Size(min = 2, max = 50, message = "نام پدر باید بین 2 تا 50 کاراکتر باشد")
    private String fatherName;

    @NotNull(message = "تاریخ تولد الزامی است")
    @Past(message = "تاریخ تولد باید در گذشته باشد")
    private LocalDate birthDate;

    @NotBlank(message = "شماره تلفن الزامی است")
    @Pattern(regexp = "^09\\d{9}$", message = "شماره تلفن باید با 09 شروع شود و 11 رقم باشد")
    private String phoneNumber;

    @Min(value = 0, message = "سابقه کار نمی‌تواند منفی باشد")
    @Max(value = 50, message = "سابقه کار نمی‌تواند بیش از 50 سال باشد")
    private Integer workExperience;

    @Size(max = 500, message = "آدرس نباید بیشتر از 500 کاراکتر باشد")
    private String address;

    private Boolean isActive = true;

    private LocalDate hireDate;
}

