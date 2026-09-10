package com.example.project.ceo_tour.tour_car.controller;

import com.example.project.ceo_tour.tour_car.dto.AssignVehicleToTourRequest;
import com.example.project.ceo_tour.tour_car.dto.TourVehicleDto;
import com.example.project.ceo_tour.tour_car.services.TourVehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ceo/tours/{tourId}/vehicles")
@RequiredArgsConstructor
@Slf4j
public class TourVehicleController {

    private final TourVehicleService service;

    @PostMapping
    public ResponseEntity<TourVehicleDto> assignVehicle(
            @PathVariable Long tourId,
            @Valid @RequestBody AssignVehicleToTourRequest request) {

        log.info("POST /api/tours/{}/vehicles - Assign vehicle [{}]",
                tourId, request.getVehicleId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.assignVehicle(tourId, request));
    }

    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<Void> removeVehicle(
            @PathVariable Long tourId,
            @PathVariable Long vehicleId) {

        log.info("DELETE /api/tours/{}/vehicles/{}", tourId, vehicleId);

        service.removeVehicle(tourId, vehicleId);

        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<TourVehicleDto>> getVehicles(@PathVariable Long tourId) {

        log.debug("GET /api/tours/{}/vehicles", tourId);

        return ResponseEntity.ok(service.getTourVehicles(tourId));
    }
}
