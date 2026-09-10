package com.example.project.ceo_car.controller;


import com.example.project.ceo_car.dto.VehicleFeatureDto;
import com.example.project.ceo_car.dto.VehicleFeatureRequest;
import com.example.project.ceo_car.dto.VehicleResponse;
import com.example.project.ceo_car.services.VehicleFeatureService;
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
@RequestMapping("/api/ceo/vehicles/features")
@RequiredArgsConstructor
public class VehicleFeatureController {

    private final VehicleFeatureService featureService;
    private static final Logger logger = LoggerFactory.getLogger(VehicleFeatureController.class);

    /**
     * ثبت ویژگی جدید (فقط CEO)
     */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<VehicleResponse> createFeature(@Valid @RequestBody VehicleFeatureRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} creating new vehicle feature", username);

        VehicleFeatureDto featureDto = featureService.createFeature(username, request);

        VehicleResponse response = VehicleResponse.builder()
                .success(true)
                .message("ویژگی با موفقیت ثبت شد")
                .data(featureDto)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * ویرایش ویژگی (فقط CEO)
     */
    @PutMapping("/{featureId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<VehicleResponse> updateFeature(
            @PathVariable Long featureId,
            @Valid @RequestBody VehicleFeatureRequest request) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} updating vehicle feature id: {}", username, featureId);

        VehicleFeatureDto featureDto = featureService.updateFeature(username, featureId, request);

        VehicleResponse response = VehicleResponse.builder()
                .success(true)
                .message("ویژگی با موفقیت ویرایش شد")
                .data(featureDto)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * حذف ویژگی (فقط CEO)
     */
    @DeleteMapping("/{featureId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<VehicleResponse> deleteFeature(@PathVariable Long featureId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} deleting vehicle feature id: {}", username, featureId);

        featureService.deleteFeature(username, featureId);

        VehicleResponse response = VehicleResponse.builder()
                .success(true)
                .message("ویژگی با موفقیت حذف شد")
                .data(null)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * دریافت یک ویژگی (فقط CEO)
     */
    @GetMapping("/{featureId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<VehicleResponse> getFeature(@PathVariable Long featureId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching vehicle feature id: {}", username, featureId);

        VehicleFeatureDto featureDto = featureService.getFeatureById(username, featureId);

        VehicleResponse response = VehicleResponse.builder()
                .success(true)
                .message("اطلاعات با موفقیت بازیابی شد")
                .data(featureDto)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * دریافت لیست تمام ویژگی‌ها (فقط CEO)
     */
    @GetMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<VehicleResponse> getAllFeatures() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching all vehicle features", username);

        List<VehicleFeatureDto> features = featureService.getAllFeatures(username);

        VehicleResponse response = VehicleResponse.builder()
                .success(true)
                .message("لیست ویژگی‌ها با موفقیت بازیابی شد")
                .data(features)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * دریافت لیست ویژگی‌های فعال (فقط CEO)
     */
    @GetMapping("/active")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<VehicleResponse> getActiveFeatures() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching active vehicle features", username);

        List<VehicleFeatureDto> features = featureService.getActiveFeatures(username);

        VehicleResponse response = VehicleResponse.builder()
                .success(true)
                .message("لیست ویژگی‌های فعال با موفقیت بازیابی شد")
                .data(features)
                .build();

        return ResponseEntity.ok(response);
    }
}

