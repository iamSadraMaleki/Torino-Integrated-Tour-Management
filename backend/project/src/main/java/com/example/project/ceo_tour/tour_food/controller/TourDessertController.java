package com.example.project.ceo_tour.tour_food.controller;

import com.example.project.ceo_tour.tour_food.dto.*;
import com.example.project.ceo_tour.tour_food.dto.TourDessertDto;
import com.example.project.ceo_tour.tour_food.services.TourDessertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/ceo/tour-dessert")
@RequiredArgsConstructor
public class TourDessertController {

    private final TourDessertService tourDessertService;

    @PostMapping
    public ResponseEntity<TourDessertDto> add(@Valid @RequestBody AddTourDessertRequest request) {
        log.info("POST /api/ceo/tour-dessert - Adding dessert to tour [{}]", request.getTourId());
        return ResponseEntity.status(HttpStatus.CREATED).body(tourDessertService.add(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TourDessertDto> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTourDessertRequest request) {
        log.info("PUT /api/ceo/tour-dessert/{} - Updating tour dessert", id);
        return ResponseEntity.ok(tourDessertService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /api/ceo/tour-dessert/{} - Deleting tour dessert", id);
        tourDessertService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tour/{tourId}")
    public ResponseEntity<List<TourDessertDto>> getByTour(@PathVariable Long tourId) {
        log.debug("GET /api/ceo/tour-dessert/tour/{}", tourId);
        return ResponseEntity.ok(tourDessertService.getByTour(tourId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourDessertDto> getById(@PathVariable Long id) {
        log.debug("GET /api/ceo/tour-dessert/{}", id);
        return ResponseEntity.ok(tourDessertService.getById(id));
    }
}
