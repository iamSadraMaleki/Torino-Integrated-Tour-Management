package com.example.project.ceo_tour.basetour.controller;

import com.example.project.ceo_tour.basetour.Services.BaseTourService;
import com.example.project.ceo_tour.basetour.dto.*;
import com.example.project.ceo_tour.station.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ceo/base-tours")
@RequiredArgsConstructor
public class BaseTourController {

    private final BaseTourService baseTourService;

    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    /* ===================== BaseTour CRUD ===================== */

    @PostMapping
    public ResponseEntity<ApiResponse<BaseTourDto>> create(@Valid @RequestBody BaseTourCreateRequest request) {
        var data = baseTourService.create(currentUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok("Base tour created", data));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BaseTourDto>>> listMyTours() {
        var data = baseTourService.getMyTours(currentUsername());
        return ResponseEntity.ok(ApiResponse.ok("Base tours fetched", data));
    }

    // جزئیات کامل: تور + ۳ لیست ایستگاه‌ها
    @GetMapping("/{tourId}")
    public ResponseEntity<ApiResponse<BaseTourDetailsDto>> getDetails(@PathVariable Long tourId) {
        var data = baseTourService.getDetails(currentUsername(), tourId);
        return ResponseEntity.ok(ApiResponse.ok("Base tour details fetched", data));
    }

    @PutMapping("/{tourId}")
    public ResponseEntity<ApiResponse<BaseTourDto>> update(
            @PathVariable Long tourId,
            @Valid @RequestBody BaseTourUpdateRequest request
    ) {
        var data = baseTourService.update(currentUsername(), tourId, request);
        return ResponseEntity.ok(ApiResponse.ok("Base tour updated", data));
    }

    @DeleteMapping("/{tourId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long tourId) {
        baseTourService.delete(currentUsername(), tourId);
        return ResponseEntity.ok(ApiResponse.ok("Base tour deleted", null));
    }

    /* ===================== Upsert Origins / Destinations / Program ===================== */

    // مبداها (مرتب شده + minutesToNext)
    @PutMapping("/{tourId}/origins")
    public ResponseEntity<ApiResponse<Void>> upsertOrigins(
            @PathVariable Long tourId,
            @Valid @RequestBody TourStationsUpsertRequest request
    ) {
        baseTourService.upsertOriginStations(currentUsername(), tourId, request);
        return ResponseEntity.ok(ApiResponse.ok("Origin stations updated", null));
    }

    // مقصدها (مرتب شده + minutesToNext)
    @PutMapping("/{tourId}/destinations")
    public ResponseEntity<ApiResponse<Void>> upsertDestinations(
            @PathVariable Long tourId,
            @Valid @RequestBody TourStationsUpsertRequest request
    ) {
        baseTourService.upsertDestinationStations(currentUsername(), tourId, request);
        return ResponseEntity.ok(ApiResponse.ok("Destination stations updated", null));
    }

    // برنامه تور (مرتب شده + minutesToNext)
    @PutMapping("/{tourId}/program")
    public ResponseEntity<ApiResponse<Void>> upsertProgram(
            @PathVariable Long tourId,
            @Valid @RequestBody TourStationsUpsertRequest request
    ) {
        baseTourService.upsertProgramStations(currentUsername(), tourId, request);
        return ResponseEntity.ok(ApiResponse.ok("Program stations updated", null));
    }
}

