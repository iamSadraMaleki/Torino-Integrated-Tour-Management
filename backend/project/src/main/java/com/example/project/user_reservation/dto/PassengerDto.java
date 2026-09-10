package com.example.project.user_reservation.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;

@Value
@Builder
public class PassengerDto {
    Long id;
    String firstName;
    String lastName;
    String nationalCode;
    String mobile;
    LocalDate birthDate;
}