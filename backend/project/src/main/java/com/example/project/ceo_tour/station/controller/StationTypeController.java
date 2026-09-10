package com.example.project.ceo_tour.station.controller;

import com.example.project.ceo_tour.station.Services.StationTypeService;
import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.ceo_tour.station.dto.StationTypeCreateRequest;
import com.example.project.ceo_tour.station.dto.StationTypeDto;
import com.example.project.ceo_tour.station.dto.StationTypeUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ceo/station-types")
@RequiredArgsConstructor
public class StationTypeController {

    private final StationTypeService stationTypeService;

    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StationTypeDto>> create(@Valid @RequestBody StationTypeCreateRequest request) {
        var data = stationTypeService.create(currentUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok("Station type created", data));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StationTypeDto>>> getMyTypes() {
        var data = stationTypeService.getMyTypes(currentUsername());
        return ResponseEntity.ok(ApiResponse.ok("Station types fetched", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StationTypeDto>> getById(@PathVariable Long id) {
        var data = stationTypeService.getById(currentUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok("Station type fetched", data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StationTypeDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody StationTypeUpdateRequest request
    ) {
        var data = stationTypeService.update(currentUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.ok("Station type updated", data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        stationTypeService.delete(currentUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok("Station type deleted", null));
    }
}

