package com.example.project.users.dto;

import com.example.project.users.model.Role;
import com.example.project.users.model.User;
import lombok.Builder;
import lombok.Data;

import java.util.Set;
import java.util.stream.Collectors;

@Data
@Builder
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String mobile;
    private String customerCode;
    private Set<String> roles;
    private boolean enabled;
    private String city;

    public static UserDto fromEntity(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .enabled(user.isEnabled())
                .customerCode(user.getCustomerCode())
                .city(user.getCity())
                .roles(user.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toSet()))
                .build();
    }
}
