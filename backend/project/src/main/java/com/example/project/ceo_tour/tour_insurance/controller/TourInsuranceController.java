package com.example.project.ceo_tour.tour_insurance.controller;

import com.example.project.ceo_tour.tour_insurance.dto.TourInsuranceDto;
import com.example.project.ceo_tour.tour_insurance.dto.TourInsuranceRequest;
import com.example.project.ceo_tour.tour_insurance.services.TourInsuranceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * بیمه‌های اختصاص‌یافته به تور (فقط مدیر آژانس)
 */
@Slf4j
@RestController
@RequestMapping("/api/ceo/tour-insurances")
@RequiredArgsConstructor
public class TourInsuranceController {

    private final TourInsuranceService tourInsuranceService;

    @PostMapping
    public ResponseEntity<TourInsuranceDto> add(@Valid @RequestBody TourInsuranceRequest request) {
        log.info("POST /api/ceo/tour-insurances - Adding insurance [{}] to tour [{}]",
                request.getInsurancePolicyId(), request.getTourId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tourInsuranceService.add(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TourInsuranceDto> update(
            @PathVariable Long id,
            @Valid @RequestBody TourInsuranceRequest request) {
        log.info("PUT /api/ceo/tour-insurances/{} - Updating tour insurance", id);
        return ResponseEntity.ok(tourInsuranceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable Long id) {
        log.info("DELETE /api/ceo/tour-insurances/{} - Removing insurance from tour", id);
        tourInsuranceService.remove(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tour/{tourId}")
    public ResponseEntity<List<TourInsuranceDto>> getByTour(@PathVariable Long tourId) {
        log.debug("GET /api/ceo/tour-insurances/tour/{} - Fetching insurances of tour", tourId);
        return ResponseEntity.ok(tourInsuranceService.getByTour(tourId));
    }
}
