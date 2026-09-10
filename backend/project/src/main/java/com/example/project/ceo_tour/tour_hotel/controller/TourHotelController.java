package com.example.project.ceo_tour.tour_hotel.controller;

import com.example.project.ceo_tour.tour_hotel.dto.TourHotelDto;
import com.example.project.ceo_tour.tour_hotel.dto.TourHotelRequest;
import com.example.project.ceo_tour.tour_hotel.services.TourHotelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/ceo/tour-hotels")
@RequiredArgsConstructor
public class TourHotelController {

    private final TourHotelService tourHotelService;

    @PostMapping
    public ResponseEntity<TourHotelDto> add(@Valid @RequestBody TourHotelRequest request) {
        log.info("POST /api/tour-hotels - Adding hotel [{}] to tour [{}]",
                request.getBaseHotelId(), request.getTourId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tourHotelService.addHotelToTour(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TourHotelDto> update(
            @PathVariable Long id,
            @Valid @RequestBody TourHotelRequest request) {
        log.info("PUT /api/tour-hotels/{} - Updating tour hotel", id);
        return ResponseEntity.ok(tourHotelService.updateTourHotel(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable Long id) {
        log.info("DELETE /api/tour-hotels/{} - Removing hotel from tour", id);
        tourHotelService.removeHotelFromTour(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tour/{tourId}")
    public ResponseEntity<List<TourHotelDto>> getByTour(@PathVariable Long tourId) {
        log.debug("GET /api/tour-hotels/tour/{} - Fetching hotels of tour", tourId);
        return ResponseEntity.ok(tourHotelService.getHotelsByTourId(tourId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourHotelDto> getById(@PathVariable Long id) {
        log.debug("GET /api/tour-hotels/{} - Fetching tour hotel by id", id);
        return ResponseEntity.ok(tourHotelService.getTourHotelById(id));
    }
}
