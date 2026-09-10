package com.example.project.discount.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.discount.services.DiscountService;
import com.example.project.users.config.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/user/discounts")
@RequiredArgsConstructor
public class UserDiscountController {

    private final DiscountService discountService;
    private final SecurityUtils securityUtils;

    /** اعتبارسنجی کد تخفیف بدون مصرف — برای دکمه «بررسی کد» در صفحه رزرو */
    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<Integer>> validate(@RequestParam String code) {
        Integer percent = discountService.validateCode(code, securityUtils.currentUsername());
        return ResponseEntity.ok(ApiResponse.ok("کد تخفیف معتبر است", percent));
    }
}
