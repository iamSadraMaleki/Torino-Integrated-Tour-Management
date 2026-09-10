package com.example.project.ceo_tour.tour.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.ceo_tour.tour.dto.TourDto;
import com.example.project.ceo_tour.tour.services.TourService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * مشاهده همه تورهای سیستم — سمت سوپرادمین/ادمین
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/tours")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
public class AdminTourController {

    private final TourService tourService;

    /** همه تورهای کل سیستم (به‌همراه مدیر آژانس برگزارکننده) */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TourDto>>> getAllTours() {
        return ResponseEntity.ok(ApiResponse.ok("همه تورها",
                tourService.getAllTours()));
    }
}
