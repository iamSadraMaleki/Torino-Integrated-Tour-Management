package com.example.project.ceo_personel.dto;


import com.example.project.ceo_personel.model.StaffMember;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StaffMemberMapper {

    private final PositionMapper positionMapper;

    public StaffMemberDto toDto(StaffMember staffMember) {
        if (staffMember == null) {
            return null;
        }

        return StaffMemberDto.builder()
                .id(staffMember.getId())
                .userId(staffMember.getUser().getId())
                .username(staffMember.getUser().getUsername())
                .position(positionMapper.toDtoWithoutStaffCount(staffMember.getPosition()))
                .fullName(staffMember.getFullName())
                .nationalCode(staffMember.getNationalCode())
                .fatherName(staffMember.getFatherName())
                .birthDate(staffMember.getBirthDate())
                .phoneNumber(staffMember.getPhoneNumber())
                .workExperience(staffMember.getWorkExperience())
                .address(staffMember.getAddress())
                .isActive(staffMember.getIsActive())
                .hireDate(staffMember.getHireDate())
                .createdAt(staffMember.getCreatedAt())
                .updatedAt(staffMember.getUpdatedAt())
                .build();
    }
}

