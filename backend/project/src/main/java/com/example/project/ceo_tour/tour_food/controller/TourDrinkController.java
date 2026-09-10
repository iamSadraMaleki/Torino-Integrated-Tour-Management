package com.example.project.ceo_tour.tour_food.controller;


import com.example.project.ceo_tour.tour_food.dto.AddTourDrinkRequest;
import com.example.project.ceo_tour.tour_food.dto.TourDrinkDto;
import com.example.project.ceo_tour.tour_food.dto.UpdateTourDrinkRequest;
import com.example.project.ceo_tour.tour_food.services.TourDrinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/ceo/tour-drink")
@RequiredArgsConstructor
public class TourDrinkController {

    private final TourDrinkService tourDrinkService;

    @PostMapping
    public ResponseEntity<TourDrinkDto> add(@Valid @RequestBody AddTourDrinkRequest request) {
        log.info("POST /api/ceo/tour-drink - Adding drink to tour [{}]", request.getTourId());
        return ResponseEntity.status(HttpStatus.CREATED).body(tourDrinkService.add(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TourDrinkDto> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTourDrinkRequest request) {
        log.info("PUT /api/ceo/tour-drink/{} - Updating tour drink", id);
        return ResponseEntity.ok(tourDrinkService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /api/ceo/tour-drink/{} - Deleting tour drink", id);
        tourDrinkService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tour/{tourId}")
    public ResponseEntity<List<TourDrinkDto>> getByTour(@PathVariable Long tourId) {
        log.debug("GET /api/ceo/tour-drink/tour/{}", tourId);
        return ResponseEntity.ok(tourDrinkService.getByTour(tourId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourDrinkDto> getById(@PathVariable Long id) {
        log.debug("GET /api/ceo/tour-drink/{}", id);
        return ResponseEntity.ok(tourDrinkService.getById(id));
    }
}
