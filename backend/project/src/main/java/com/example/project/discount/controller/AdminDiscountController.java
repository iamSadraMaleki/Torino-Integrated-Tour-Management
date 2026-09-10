package com.example.project.discount.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.discount.dto.DiscountCodeDto;
import com.example.project.discount.dto.DiscountCodeRequest;
import com.example.project.discount.dto.TourSpecialDiscountDto;
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
@RequestMapping("/api/admin/discounts")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
@RequiredArgsConstructor
public class AdminDiscountController {

    private final DiscountService discountService;
    private final SecurityUtils securityUtils;

    /** مانیتورینگ همه تخفیف‌های ویژه */
    @GetMapping("/special")
    public ResponseEntity<ApiResponse<List<TourSpecialDiscountDto>>> getAllSpecials() {
        return ResponseEntity.ok(ApiResponse.ok("همه تخفیف‌های ویژه", discountService.getAllSpecials()));
    }

    @DeleteMapping("/special/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSpecial(@PathVariable Long id) {
        discountService.deleteSpecial(id);
        return ResponseEntity.ok(ApiResponse.ok("تخفیف ویژه حذف شد", null));
    }

    @PutMapping("/special/{id}/toggle")
    public ResponseEntity<ApiResponse<TourSpecialDiscountDto>> toggleSpecial(
            @PathVariable Long id, @RequestParam boolean active) {
        return ResponseEntity.ok(ApiResponse.ok("وضعیت تخفیف ویژه تغییر کرد",
                discountService.toggleSpecial(id, active)));
    }

    /** مانیتورینگ همه کدهای تخفیف */
    @GetMapping("/codes")
    public ResponseEntity<ApiResponse<List<DiscountCodeDto>>> getAllCodes() {
        return ResponseEntity.ok(ApiResponse.ok("همه کدهای تخفیف", discountService.getAllCodes()));
    }

    /** ساخت کد تخفیف توسط سوپرادمین — با ارسال به اینباکس کاربر */
    @PostMapping("/codes")
    public ResponseEntity<ApiResponse<DiscountCodeDto>> createCode(
            @Valid @RequestBody DiscountCodeRequest request) {
        DiscountCodeDto data = discountService.createCode(
                securityUtils.currentUsername(), "ROLE_SUPERADMIN", request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("کد تخفیف ساخته شد" +
                        (data.getForUserUsername() != null ? " و به اینباکس «" + data.getForUserUsername() + "» ارسال شد" : ""),
                        data));
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
