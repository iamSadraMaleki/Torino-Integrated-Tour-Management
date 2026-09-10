package com.example.project.review.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.review.dto.ReviewRequest;
import com.example.project.review.dto.TourReviewDto;
import com.example.project.review.services.ReviewService;
import com.example.project.users.config.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final SecurityUtils securityUtils;

    // ========== کاربر ==========

    /** ثبت نظر برای یک تور (فقط مسافر تأییدشده با سفر تمام‌شده) */
    @PostMapping("/api/user/reviews")
    public ResponseEntity<ApiResponse<TourReviewDto>> create(@Valid @RequestBody ReviewRequest request) {
        TourReviewDto data = reviewService.create(securityUtils.currentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("نظر شما ثبت شد", data));
    }

    /** نظرات من */
    @GetMapping("/api/user/reviews/mine")
    public ResponseEntity<ApiResponse<List<TourReviewDto>>> getMyReviews() {
        List<TourReviewDto> data = reviewService.getMyReviews(securityUtils.currentUserId());
        return ResponseEntity.ok(ApiResponse.ok("نظرات شما", data));
    }

    // ========== مدیر آژانس ==========

    /** نظرات مسافران روی تورهای این آژانس */
    @GetMapping("/api/ceo/reviews")
    public ResponseEntity<ApiResponse<List<TourReviewDto>>> getCeoReviews() {
        List<TourReviewDto> data = reviewService.getCeoReviews(securityUtils.currentUsername());
        return ResponseEntity.ok(ApiResponse.ok("نظرات مسافران", data));
    }

    // ========== سوپرادمین ==========

    /** مانیتورینگ همه نظرات */
    @GetMapping("/api/admin/reviews")
    public ResponseEntity<ApiResponse<List<TourReviewDto>>> getAllReviews() {
        List<TourReviewDto> data = reviewService.getAllReviews();
        return ResponseEntity.ok(ApiResponse.ok("همه نظرات", data));
    }

    /** حذف نظر نامرتبط توسط ادمین */
    @DeleteMapping("/api/admin/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long reviewId) {
        reviewService.delete(reviewId);
        return ResponseEntity.ok(ApiResponse.ok("نظر حذف شد", null));
    }
}
