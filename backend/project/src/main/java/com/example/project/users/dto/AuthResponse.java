package com.example.project.users.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.Set;


@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Set<String> roles;
}