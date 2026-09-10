package com.example.project.ceo_car.controller;


import com.example.project.ceo_car.dto.VehicleDto;
import com.example.project.ceo_car.dto.VehicleRequest;
import com.example.project.ceo_car.dto.VehicleResponse;
import com.example.project.ceo_car.dto.VehicleStatisticsDto;
import com.example.project.ceo_car.model.VehicleStatus;
import com.example.project.ceo_car.model.VehicleType;
import com.example.project.ceo_car.services.VehicleService;
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
@RequestMapping("/api/ceo/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;
    private static final Logger logger = LoggerFactory.getLogger(VehicleController.class);

    /**
     * ثبت ماشین جدید (فقط CEO)
     */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<VehicleResponse> createVehicle(@Valid @RequestBody VehicleRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} creating new vehicle", username);

        VehicleDto vehicleDto = vehicleService.createVehicle(username, request);

        VehicleResponse response = VehicleResponse.builder()
                .success(true)
                .message("ماشین با موفقیت ثبت شد")
                .data(vehicleDto)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * ویرایش ماشین (فقط CEO)
     */
    @PutMapping("/{vehicleId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable Long vehicleId,
            @Valid @RequestBody VehicleRequest request) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} updating vehicle id: {}", username, vehicleId);

        VehicleDto vehicleDto = vehicleService.updateVehicle(username, vehicleId, request);

        VehicleResponse response = VehicleResponse.builder()
                .success(true)
                .message("ماشین با موفقیت ویرایش شد")
                .data(vehicleDto)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * حذف ماشین (فقط CEO)
     */
    @DeleteMapping("/{vehicleId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<VehicleResponse> deleteVehicle(@PathVariable Long vehicleId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} deleting vehicle id: {}", username, vehicleId);

        vehicleService.deleteVehicle(username, vehicleId);

        VehicleResponse response = VehicleResponse.builder()
                .success(true)
                .message("ماشین با موفقیت حذف شد")
                .data(null)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * دریافت یک ماشین (فقط CEO)
     */
    @GetMapping("/{vehicleId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<VehicleResponse> getVehicle(@PathVariable Long vehicleId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching vehicle id: {}", username, vehicleId);

        VehicleDto vehicleDto = vehicleService.getVehicleById(username, vehicleId);

        VehicleResponse response = VehicleResponse.builder()
                .success(true)
                .message("اطلاعات با موفقیت بازیابی شد")
                .data(vehicleDto)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * دریافت لیست تمام ماشین‌ها (فقط CEO)
     */
    @GetMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<VehicleResponse> getAllVehicles() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching all vehicles", username);

        List<VehicleDto> vehicles = vehicleService.getAllVehicles(username);

        VehicleResponse response = VehicleResponse.builder()
                .success(true)
                .message("لیست ماشین‌ها با موفقیت بازیابی شد")
                .data(vehicles)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * دریافت لیست ماشین‌ها بر اساس وضعیت (فقط CEO)
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<VehicleResponse> getVehiclesByStatus(@PathVariable VehicleStatus status) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching vehicles by status: {}", username, status);

        List<VehicleDto> vehicles = vehicleService.getVehiclesByStatus(username, status);

        VehicleResponse response = VehicleResponse.builder()
                .success(true)
                .message("لیست ماشین‌ها با موفقیت بازیابی شد")
                .data(vehicles)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * دریافت لیست ماشین‌ها بر اساس نوع (فقط CEO)
     */
    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<VehicleResponse> getVehiclesByType(@PathVariable VehicleType type) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching vehicles by type: {}", username, type);

        List<VehicleDto> vehicles = vehicleService.getVehiclesByType(username, type);

        VehicleResponse response = VehicleResponse.builder()
                .success(true)
                .message("لیست ماشین‌ها با موفقیت بازیابی شد")
                .data(vehicles)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * دریافت آمار ماشین‌ها (فقط CEO)
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<VehicleResponse> getStatistics() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching vehicle statistics", username);

        VehicleStatisticsDto statistics = vehicleService.getStatistics(username);

        VehicleResponse response = VehicleResponse.builder()
                .success(true)
                .message("آمار با موفقیت بازیابی شد")
                .data(statistics)
                .build();

        return ResponseEntity.ok(response);
    }
}
