package com.example.project.profile.verification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CeoVerificationRequest {

    @NotBlank(message = "نام آژانس الزامی است")
    private String agencyName;

    @NotBlank(message = "نام حقوقی الزامی است")
    private String legalName;

    @NotBlank(message = "نام مدیر عامل الزامی است")
    private String ceoName;

    @NotBlank(message = "شماره ثبت الزامی است")
    private String registrationNumber;

    @NotNull(message = "تاریخ انقضای مجوز الزامی است")
    private LocalDate licenseExpiryDate;

    @NotBlank(message = "شماره مالیات الزامی است")
    private String taxNumber;

    @NotNull(message = "تاریخ تاسیس الزامی است")
    private LocalDate establishmentDate;

    @NotBlank(message = "ایمیل شرکت الزامی است")
    @Email(message = "فرمت ایمیل صحیح نیست")
    private String companyEmail;

    @NotBlank(message = "شماره تلفن شرکت الزامی است")
    private String companyPhone;
}

