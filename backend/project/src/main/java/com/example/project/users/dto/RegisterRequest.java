package com.example.project.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;


@Data
public class RegisterRequest {
    @NotBlank
    @Size(min = 3, max = 50)
    private String username;


    @NotBlank
    @Size(min = 6, max = 100)
    private String password;


    @NotBlank
    @Email
    private String email;


    @NotBlank
    private String mobile;

    @NotBlank
    private String role;

    /** شهر کاربر (اختیاری - برای اطلاعیه‌های هدفمند بر اساس شهر) */
    private String city;
}