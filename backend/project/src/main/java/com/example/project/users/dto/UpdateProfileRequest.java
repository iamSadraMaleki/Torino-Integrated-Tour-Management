package com.example.project.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Email(message = "Invalid email format")
    private String email;

    @Pattern(regexp = "^09\\d{9}$", message = "Invalid mobile number format")
    private String mobile;

    /** شهر کاربر (اختیاری) */
    private String city;
}

