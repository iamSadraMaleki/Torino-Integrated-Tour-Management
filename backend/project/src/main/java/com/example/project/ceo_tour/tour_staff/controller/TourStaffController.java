package com.example.project.ceo_tour.tour_staff.controller;

import com.example.project.ceo_tour.tour_staff.dto.AssignStaffToTourDTO;
import com.example.project.ceo_tour.tour_staff.dto.TourStaffResponseDTO;
import com.example.project.ceo_tour.tour_staff.services.TourStaffService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ceo/tours/staff")
@RequiredArgsConstructor
public class TourStaffController {

    private final TourStaffService tourStaffService;

    @PostMapping("/assign")
    public ResponseEntity<TourStaffResponseDTO> assign(
            @RequestBody AssignStaffToTourDTO request) {

        return ResponseEntity.ok(
                tourStaffService.assignStaff(request));
    }

    @GetMapping("/{tourId}")
    public ResponseEntity<List<TourStaffResponseDTO>> getByTour(
            @PathVariable Long tourId) {

        return ResponseEntity.ok(
                tourStaffService.getStaffByTour(tourId));
    }

    @DeleteMapping("/{tourId}/{staffId}")
    public ResponseEntity<Void> remove(
            @PathVariable Long tourId,
            @PathVariable Long staffId) {

        tourStaffService.removeStaff(tourId, staffId);
        return ResponseEntity.noContent().build();
    }
}