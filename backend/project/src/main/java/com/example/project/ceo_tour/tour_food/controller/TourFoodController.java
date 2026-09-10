package com.example.project.ceo_tour.tour_food.controller;

import com.example.project.ceo_tour.tour_food.dto.*;
import com.example.project.ceo_tour.tour_food.services.TourFoodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/ceo/tour-food")
@RequiredArgsConstructor
public class TourFoodController {

    private final TourFoodService tourFoodService;

    @PostMapping
    public ResponseEntity<TourFoodDto> add(@Valid @RequestBody AddTourFoodRequest request) {
        log.info("POST /api/ceo/tour-food - Adding food to tour [{}] day [{}]",
                request.getTourId(), request.getServeDay());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tourFoodService.add(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TourFoodDto> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTourFoodRequest request) {
        log.info("PUT /api/ceo/tour-food/{} - Updating tour food", id);
        return ResponseEntity.ok(tourFoodService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /api/ceo/tour-food/{} - Deleting tour food", id);
        tourFoodService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tour/{tourId}")
    public ResponseEntity<List<TourFoodDto>> getByTour(@PathVariable Long tourId) {
        log.debug("GET /api/ceo/tour-food/tour/{} - Fetching foods of tour", tourId);
        return ResponseEntity.ok(tourFoodService.getByTour(tourId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourFoodDto> getById(@PathVariable Long id) {
        log.debug("GET /api/ceo/tour-food/{} - Fetching tour food by id", id);
        return ResponseEntity.ok(tourFoodService.getById(id));
    }

    @GetMapping("/tour/{tourId}/menu")
    public ResponseEntity<List<TourMenuByDayDto>> getMenuByDay(@PathVariable Long tourId) {
        log.debug("GET /api/ceo/tour-food/tour/{}/menu - Fetching menu grouped by day", tourId);
        return ResponseEntity.ok(tourFoodService.getMenuGroupedByDay(tourId));
    }
}
