package com.example.project.ceo_personel.controller;


import com.example.project.ceo_personel.dto.PositionDto;
import com.example.project.ceo_personel.dto.PositionRequest;
import com.example.project.ceo_personel.dto.StaffResponse;
import com.example.project.ceo_personel.services.PositionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ceo/staff/positions")
@RequiredArgsConstructor
public class PositionController {

    private final PositionService positionService;
    private static final Logger logger = LoggerFactory.getLogger(PositionController.class);


    @PostMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> createPosition(@Valid @RequestBody PositionRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} creating new position", username);

        PositionDto positionDto = positionService.createPosition(username, request);

        StaffResponse response = StaffResponse.builder()
                .success(true)
                .message("سمت با موفقیت ثبت شد")
                .data(positionDto)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{positionId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> updatePosition(
            @PathVariable Long positionId,
            @Valid @RequestBody PositionRequest request) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} updating position id: {}", username, positionId);

        PositionDto positionDto = positionService.updatePosition(username, positionId, request);

        StaffResponse response = StaffResponse.builder()
                .success(true)
                .message("سمت با موفقیت ویرایش شد")
                .data(positionDto)
                .build();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{positionId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> deletePosition(@PathVariable Long positionId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} deleting position id: {}", username, positionId);

        positionService.deletePosition(username, positionId);

        StaffResponse response = StaffResponse.builder()
                .success(true)
                .message("سمت با موفقیت حذف شد")
                .data(null)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{positionId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> getPosition(@PathVariable Long positionId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching position id: {}", username, positionId);

        PositionDto positionDto = positionService.getPositionById(username, positionId);

        StaffResponse response = StaffResponse.builder()
                .success(true)
                .message("اطلاعات با موفقیت بازیابی شد")
                .data(positionDto)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> getAllPositions() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching all positions", username);

        List<PositionDto> positions = positionService.getAllPositions(username);

        StaffResponse response = StaffResponse.builder()
                .success(true)
                .message("لیست سمت‌ها با موفقیت بازیابی شد")
                .data(positions)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> getActivePositions() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching active positions", username);

        List<PositionDto> positions = positionService.getActivePositions(username);

        StaffResponse response = StaffResponse.builder()
                .success(true)
                .message("لیست سمت‌های فعال با موفقیت بازیابی شد")
                .data(positions)
                .build();

        return ResponseEntity.ok(response);
    }

}
