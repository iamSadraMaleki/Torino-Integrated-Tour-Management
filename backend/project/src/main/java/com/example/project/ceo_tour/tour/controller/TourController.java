package com.example.project.ceo_tour.tour.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.ceo_tour.tour.dto.*;

import com.example.project.ceo_tour.tour.model.TourStatus;
import com.example.project.ceo_tour.tour.services.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/ceo/tours")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    /* ===================== Tour CRUD ===================== */

    @PostMapping
    public ResponseEntity<ApiResponse<TourDto>> create(
            @Valid @RequestBody TourCreateRequest request
    ) {
        var data = tourService.create(currentUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok("Tour created from base tour", data));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TourDto>>> listMyTours() {
        var data = tourService.getMyTours(currentUsername());
        return ResponseEntity.ok(ApiResponse.ok("Tours fetched", data));
    }

    @GetMapping("/{tourId}")
    public ResponseEntity<ApiResponse<TourDetailsDto>> getDetails(@PathVariable Long tourId) {
        var data = tourService.getDetails(currentUsername(), tourId);
        return ResponseEntity.ok(ApiResponse.ok("Tour details fetched", data));
    }

    @PutMapping("/{tourId}")
    public ResponseEntity<ApiResponse<TourDto>> update(
            @PathVariable Long tourId,
            @Valid @RequestBody TourUpdateRequest request
    ) {
        var data = tourService.update(currentUsername(), tourId, request);
        return ResponseEntity.ok(ApiResponse.ok("Tour updated", data));
    }

    @DeleteMapping("/{tourId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long tourId) {
        tourService.delete(currentUsername(), tourId);
        return ResponseEntity.ok(ApiResponse.ok("Tour deleted", null));
    }

    /* ===================== Toggle Stations Active/Inactive ===================== */

    @PatchMapping("/{tourId}/origins/toggle")
    public ResponseEntity<ApiResponse<Void>> toggleOriginStation(
            @PathVariable Long tourId,
            @Valid @RequestBody TourStationToggleRequest request
    ) {
        tourService.toggleOriginStation(currentUsername(), tourId, request);

        String message = request.getIsActive()
                ? "Origin station activated and reordered"
                : "Origin station deactivated and reordered";

        return ResponseEntity.ok(ApiResponse.ok(message, null));
    }


    @PatchMapping("/{tourId}/destinations/toggle")
    public ResponseEntity<ApiResponse<Void>> toggleDestinationStation(
            @PathVariable Long tourId,
            @Valid @RequestBody TourStationToggleRequest request
    ) {
        tourService.toggleDestinationStation(currentUsername(), tourId, request);

        String message = request.getIsActive()
                ? "Destination station activated and reordered"
                : "Destination station deactivated and reordered";

        return ResponseEntity.ok(ApiResponse.ok(message, null));
    }


    @PatchMapping("/{tourId}/program/toggle")
    public ResponseEntity<ApiResponse<Void>> toggleProgramStation(
            @PathVariable Long tourId,
            @Valid @RequestBody TourStationToggleRequest request
    ) {
        tourService.toggleProgramStation(currentUsername(), tourId, request);

        String message = request.getIsActive()
                ? "Program station activated and reordered"
                : "Program station deactivated and reordered";

        return ResponseEntity.ok(ApiResponse.ok(message, null));
    }


    @PostMapping("/{tourId}/origin-stations")
    public ResponseEntity<ApiResponse<Void>> addOriginStation(
            @PathVariable Long tourId,
            @Valid @RequestBody TourStationItemDto request) {

        tourService.addOriginStation(currentUsername(), tourId, request);
        return ResponseEntity.ok(ApiResponse.ok("Origin station added", null));
    }

    @PostMapping("/{tourId}/destination-stations")
    public ResponseEntity<ApiResponse<Void>> addDestinationStation(
            @PathVariable Long tourId,
            @Valid @RequestBody TourStationItemDto request) {

        tourService.addDestinationStation(currentUsername(), tourId, request);
        return ResponseEntity.ok(ApiResponse.ok("Destination station added", null));
    }

    @PostMapping("/{tourId}/program-stations")
    public ResponseEntity<ApiResponse<Void>> addProgramStation(
            @PathVariable Long tourId,
            @Valid @RequestBody TourStationItemDto request) {

        tourService.addProgramStation(currentUsername(), tourId, request);
        return ResponseEntity.ok(ApiResponse.ok("Program station added", null));
    }

    @PatchMapping("/{tourId}/status")
    public ResponseEntity<ApiResponse<TourDto>> changeStatus(
            @PathVariable Long tourId,
            @RequestParam TourStatus status) {

        TourDto updated = tourService.changeStatus(currentUsername(), tourId, status);
        return ResponseEntity.ok(ApiResponse.ok("Tour status changed to " + status.name(), updated));
    }
    // به TourController.java اضافه کن:

    @PostMapping("/{tourId}/suspend")
    public ResponseEntity<ApiResponse<TourDto>> suspend(@PathVariable Long tourId) {
        TourDto updated = tourService.changeStatus(currentUsername(), tourId, TourStatus.SUSPENDED);
        return ResponseEntity.ok(ApiResponse.ok("Tour suspended", updated));
    }

    @PostMapping("/{tourId}/activate")
    public ResponseEntity<ApiResponse<TourDto>> activate(@PathVariable Long tourId) {
        TourDto updated = tourService.changeStatus(currentUsername(), tourId, TourStatus.ACTIVE);
        return ResponseEntity.ok(ApiResponse.ok("Tour activated", updated));
    }
    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<List<TourDto>>> getMyToursByStatus(
            @RequestParam(required = false) TourStatus status) {
        List<TourDto> data;
        if (status != null) {
            data = tourService.getMyToursByStatus(currentUsername(), status);
        } else {
            data = tourService.getMyTours(currentUsername());
        }
        return ResponseEntity.ok(ApiResponse.ok("Tours fetched", data));
    }

}
