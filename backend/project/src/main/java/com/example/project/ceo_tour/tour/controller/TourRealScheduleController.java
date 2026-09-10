package com.example.project.ceo_tour.tour.controller;


import com.example.project.ceo_tour.tour.dto.*;
import com.example.project.ceo_tour.tour.services.TourRealScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ceo/tours/schedule")
@RequiredArgsConstructor
public class TourRealScheduleController {

    private final TourRealScheduleService tourRealScheduleService;

    // =====================================================
    // 1️⃣ تولید برنامه زمانی واقعی
    // =====================================================
    @PostMapping("/generate")
    public ResponseEntity<List<TourRealScheduleResponseDTO>> generateSchedule(
            @RequestBody CreateTourScheduleRequestDTO request) {

        return ResponseEntity.ok(
                tourRealScheduleService.generateSchedule(request)
        );
    }

    // =====================================================
    // 2️⃣ اعمال تاخیر
    // =====================================================
    @PostMapping("/apply-delay")
    public ResponseEntity<List<TourRealScheduleResponseDTO>> applyDelay(
            @RequestBody ApplyDelayDTO request) {

        return ResponseEntity.ok(
                tourRealScheduleService.applyDelay(request)
        );
    }

    // =====================================================
    // 3️⃣ گرفتن ساعت‌های یک تور
    // =====================================================
    @GetMapping("/{tourId}")
    public ResponseEntity<List<TourRealScheduleResponseDTO>> getByTour(
            @PathVariable Long tourId) {

        return ResponseEntity.ok(
                tourRealScheduleService.getByTour(tourId)
        );
    }
}