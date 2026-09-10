package com.example.project.discount.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.discount.dto.DiscountCodeDto;
import com.example.project.discount.dto.DiscountCodeRequest;
import com.example.project.discount.dto.TourSpecialDiscountDto;
import com.example.project.discount.dto.TourSpecialDiscountRequest;
import com.example.project.discount.services.DiscountService;
import com.example.project.users.config.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/ceo/discounts")
@PreAuthorize("hasRole('ROLE_CEO')")
@RequiredArgsConstructor
public class CeoDiscountController {

    private final DiscountService discountService;
    private final SecurityUtils securityUtils;

    // ============ تور ویژه ============

    @GetMapping("/special")
    public ResponseEntity<ApiResponse<List<TourSpecialDiscountDto>>> getSpecials() {
        return ResponseEntity.ok(ApiResponse.ok("تخفیف‌های ویژه شما",
                discountService.getCeoSpecials(securityUtils.currentUsername())));
    }

    @PostMapping("/special")
    public ResponseEntity<ApiResponse<TourSpecialDiscountDto>> createSpecial(
            @Valid @RequestBody TourSpecialDiscountRequest request) {
        TourSpecialDiscountDto data = discountService.createSpecial(securityUtils.currentUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("تخفیف ویژه تور فعال شد", data));
    }

    @PutMapping("/special/{id}/toggle")
    public ResponseEntity<ApiResponse<TourSpecialDiscountDto>> toggleSpecial(
            @PathVariable Long id, @RequestParam boolean active) {
        return ResponseEntity.ok(ApiResponse.ok("وضعیت تخفیف ویژه تغییر کرد",
                discountService.toggleSpecial(id, active)));
    }

    @DeleteMapping("/special/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSpecial(@PathVariable Long id) {
        discountService.deleteSpecial(id);
        return ResponseEntity.ok(ApiResponse.ok("تخفیف ویژه حذف شد", null));
    }

    // ============ کد تخفیف ============

    @GetMapping("/codes")
    public ResponseEntity<ApiResponse<List<DiscountCodeDto>>> getCodes() {
        return ResponseEntity.ok(ApiResponse.ok("کدهای تخفیف شما",
                discountService.getCeoCodes(securityUtils.currentUsername())));
    }

    @PostMapping("/codes")
    public ResponseEntity<ApiResponse<DiscountCodeDto>> createCode(
            @Valid @RequestBody DiscountCodeRequest request) {
        DiscountCodeDto data = discountService.createCode(
                securityUtils.currentUsername(), "ROLE_CEO", request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("کد تخفیف ساخته شد", data));
    }

    @PutMapping("/codes/{id}/toggle")
    public ResponseEntity<ApiResponse<DiscountCodeDto>> toggleCode(
            @PathVariable Long id, @RequestParam boolean active) {
        return ResponseEntity.ok(ApiResponse.ok("وضعیت کد تخفیف تغییر کرد",
                discountService.toggleCode(id, active)));
    }

    @DeleteMapping("/codes/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCode(@PathVariable Long id) {
        discountService.deleteCode(id);
        return ResponseEntity.ok(ApiResponse.ok("کد تخفیف حذف شد", null));
    }
}
