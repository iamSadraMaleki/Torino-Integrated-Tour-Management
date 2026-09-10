package com.example.project.ceo_car_seat.controller;

import com.example.project.ceo_car_seat.dto.SeatArrangementDto;
import com.example.project.ceo_car_seat.dto.SeatArrangementRequest;
import com.example.project.ceo_car_seat.dto.SeatResponse;
import com.example.project.ceo_car_seat.services.SeatArrangementService;
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
@RequestMapping("/api/ceo/seat-arrangements")
@RequiredArgsConstructor
public class SeatArrangementController {

    private final SeatArrangementService arrangementService;
    private static final Logger logger = LoggerFactory.getLogger(SeatArrangementController.class);


    @PostMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<SeatResponse> createArrangement(@Valid @RequestBody SeatArrangementRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} creating seat arrangement", username);

        SeatArrangementDto dto = arrangementService.createArrangement(username, request);

        SeatResponse response = SeatResponse.builder()
                .success(true)
                .message("الگوی چینش با موفقیت ایجاد شد")
                .data(dto)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{arrangementId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<SeatResponse> updateArrangement(
            @PathVariable Long arrangementId,
            @Valid @RequestBody SeatArrangementRequest request) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} updating arrangement {}", username, arrangementId);

        SeatArrangementDto dto = arrangementService.updateArrangement(username, arrangementId, request);

        SeatResponse response = SeatResponse.builder()
                .success(true)
                .message("الگوی چینش با موفقیت ویرایش شد")
                .data(dto)
                .build();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{arrangementId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<SeatResponse> deleteArrangement(@PathVariable Long arrangementId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} deleting arrangement {}", username, arrangementId);

        arrangementService.deleteArrangement(username, arrangementId);

        SeatResponse response = SeatResponse.builder()
                .success(true)
                .message("الگوی چینش با موفقیت حذف شد")
                .data(null)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{arrangementId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<SeatResponse> getArrangement(@PathVariable Long arrangementId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching arrangement {}", username, arrangementId);

        SeatArrangementDto dto = arrangementService.getArrangement(username, arrangementId);

        SeatResponse response = SeatResponse.builder()
                .success(true)
                .message("الگوی چینش با موفقیت بازیابی شد")
                .data(dto)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<SeatResponse> getAllArrangements() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching all arrangements", username);

        List<SeatArrangementDto> dtos = arrangementService.getAllArrangements(username);

        SeatResponse response = SeatResponse.builder()
                .success(true)
                .message("لیست الگوهای چینش با موفقیت بازیابی شد")
                .data(dtos)
                .build();

        return ResponseEntity.ok(response);
    }


    @GetMapping("/default")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<SeatResponse> getDefaultArrangement() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching default arrangement", username);

        SeatArrangementDto dto = arrangementService.getDefaultArrangement(username);

        SeatResponse response = SeatResponse.builder()
                .success(true)
                .message("الگوی پیش‌فرض با موفقیت بازیابی شد")
                .data(dto)
                .build();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{arrangementId}/set-default")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<SeatResponse> setDefaultArrangement(@PathVariable Long arrangementId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} setting arrangement {} as default", username, arrangementId);

        SeatArrangementDto dto = arrangementService.setDefaultArrangement(username, arrangementId);

        SeatResponse response = SeatResponse.builder()
                .success(true)
                .message("الگو به عنوان پیش‌فرض تنظیم شد")
                .data(dto)
                .build();

        return ResponseEntity.ok(response);
    }
}
