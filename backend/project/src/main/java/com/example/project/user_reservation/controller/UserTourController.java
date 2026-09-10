package com.example.project.user_reservation.controller;


import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.discount.dto.TourSpecialDiscountDto;
import com.example.project.discount.services.DiscountService;
import com.example.project.user_reservation.dto.SeatStatusDto;
import com.example.project.user_reservation.dto.UserTourDetailsDto;
import com.example.project.user_reservation.dto.UserTourDto;

import com.example.project.user_reservation.services.UserTourService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/user/tours")
@RequiredArgsConstructor
public class UserTourController {

    private final UserTourService userTourService;
    private final DiscountService discountService;

    // 0. تورهای ویژه (تخفیف‌دار) — عمومی
    @GetMapping("/special")
    public ResponseEntity<ApiResponse<List<TourSpecialDiscountDto>>> getSpecialTours() {
        log.info("GET /api/user/tours/special - Fetching special discounted tours");
        var data = discountService.getActiveSpecials();
        return ResponseEntity.ok(ApiResponse.ok("تورهای ویژه", data));
    }

    // 1. دریافت همه تورهای فعال
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserTourDto>>> getAllAvailableTours() {
        log.info("GET /api/user/tours - Fetching all available tours");
        var data = userTourService.getAllAvailableTours();
        return ResponseEntity.ok(ApiResponse.ok("لیست تورهای فعال", data));
    }

    // 2. دریافت جزئیات کامل یک تور
    @GetMapping("/{tourId}")
    public ResponseEntity<ApiResponse<UserTourDetailsDto>> getTourDetails(@PathVariable Long tourId) {
        log.info("GET /api/user/tours/{} - Fetching tour details", tourId);
        var data = userTourService.getTourDetails(tourId);
        return ResponseEntity.ok(ApiResponse.ok("جزئیات تور", data));
    }

    // 3. دریافت وضعیت صندلی‌های یک تور
    @GetMapping("/{tourId}/seats")
    public ResponseEntity<ApiResponse<List<SeatStatusDto>>> getTourSeatsStatus(@PathVariable Long tourId) {
        log.info("GET /api/user/tours/{}/seats - Fetching seats status", tourId);
        var data = userTourService.getTourSeatsStatus(tourId);
        return ResponseEntity.ok(ApiResponse.ok("وضعیت صندلی‌ها", data));
    }

    // 4. دریافت اطلاعات پرداخت تور
    @GetMapping("/{tourId}/payment-info")
    public ResponseEntity<ApiResponse<com.example.project.user_reservation.dto.TourPaymentInfoDto>> getTourPaymentInfo(@PathVariable Long tourId) {
        log.info("GET /api/user/tours/{}/payment-info - Fetching payment info", tourId);
        var data = userTourService.getTourPaymentInfo(tourId);
        return ResponseEntity.ok(ApiResponse.ok("اطلاعات پرداخت", data));
    }
}
