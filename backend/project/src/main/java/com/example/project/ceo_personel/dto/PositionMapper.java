package com.example.project.ceo_personel.dto;


import com.example.project.ceo_personel.model.Position;
import com.example.project.ceo_personel.repository.StaffMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PositionMapper {

    private final StaffMemberRepository staffMemberRepository;

    public PositionDto toDto(Position position) {
        if (position == null) {
            return null;
        }

        long staffCount = staffMemberRepository.countByPositionId(position.getId());

        return PositionDto.builder()
                .id(position.getId())
                .userId(position.getUser().getId())
                .username(position.getUser().getUsername())
                .title(position.getTitle())
                .description(position.getDescription())
                .isActive(position.getIsActive())
                .staffCount(staffCount)
                .createdAt(position.getCreatedAt())
                .updatedAt(position.getUpdatedAt())
                .build();
    }

    public PositionDto toDtoWithoutStaffCount(Position position) {
        if (position == null) {
            return null;
        }

        return PositionDto.builder()
                .id(position.getId())
                .userId(position.getUser().getId())
                .username(position.getUser().getUsername())
                .title(position.getTitle())
                .description(position.getDescription())
                .isActive(position.getIsActive())
                .createdAt(position.getCreatedAt())
                .updatedAt(position.getUpdatedAt())
                .build();
    }
}

