package com.example.project.profile.ceoinfo.mapper;


import com.example.project.profile.ceoinfo.dto.CeoProfileDto;
import com.example.project.profile.ceoinfo.model.CeoProfile;
import org.springframework.stereotype.Component;

@Component
public class CeoProfileMapper {

    public CeoProfileDto toDto(CeoProfile profile) {
        if (profile == null) {
            return null;
        }

        return CeoProfileDto.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .username(profile.getUser().getUsername())
                .fullName(profile.getFullName())
                .nationalCode(profile.getNationalCode())
                .birthDate(profile.getBirthDate())
                .phoneNumber(profile.getPhoneNumber())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}

