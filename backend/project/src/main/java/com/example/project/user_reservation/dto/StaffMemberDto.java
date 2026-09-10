package com.example.project.user_reservation.dto;


import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class StaffMemberDto {
    Long id;
    String firstName;
    String lastName;
    String role;
    String phone;
}
