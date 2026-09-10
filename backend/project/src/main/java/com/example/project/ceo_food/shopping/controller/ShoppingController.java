package com.example.project.ceo_food.shopping.controller;

import com.example.project.ceo_food.shopping.dto.ShoppingItemRequest;
import com.example.project.ceo_food.shopping.dto.ShoppingResponse;
import com.example.project.ceo_food.shopping.services.ShoppingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * لیست خرید و تاریخچه خریدها (فقط مدیر آژانس)
 */
@RestController
@RequestMapping("/api/ceo/shopping-items")
@RequiredArgsConstructor
public class ShoppingController {

    private final ShoppingService shoppingService;

    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    /** ثبت قلم جدید در لیست خرید */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<ShoppingResponse> create(@Valid @RequestBody ShoppingItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ShoppingResponse.builder()
                        .success(true)
                        .message("قلم به لیست خرید اضافه شد")
                        .data(shoppingService.create(currentUsername(), request))
                        .build());
    }

    /** همه اقلام (با وضعیت) */
    @GetMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<ShoppingResponse> getAll() {
        return ResponseEntity.ok(ShoppingResponse.builder()
                .success(true)
                .message("لیست خرید")
                .data(shoppingService.getAll(currentUsername()))
                .build());
    }

    /** ویرایش قلم (فقط در انتظار خرید) */
    @PutMapping("/{itemId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<ShoppingResponse> update(
            @PathVariable Long itemId,
            @Valid @RequestBody ShoppingItemRequest request) {
        return ResponseEntity.ok(ShoppingResponse.builder()
                .success(true)
                .message("قلم با موفقیت ویرایش شد")
                .data(shoppingService.update(currentUsername(), itemId, request))
                .build());
    }

    /** علامت‌گذاری به‌عنوان خریداری‌شده (+ اضافه خودکار به انبار در صورت لینک) */
    @PatchMapping("/{itemId}/purchase")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<ShoppingResponse> markPurchased(@PathVariable Long itemId) {
        return ResponseEntity.ok(ShoppingResponse.builder()
                .success(true)
                .message("قلم به‌عنوان خریداری‌شده علامت خورد")
                .data(shoppingService.markPurchased(currentUsername(), itemId))
                .build());
    }

    /** لغو قلم */
    @PatchMapping("/{itemId}/cancel")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<ShoppingResponse> cancel(@PathVariable Long itemId) {
        return ResponseEntity.ok(ShoppingResponse.builder()
                .success(true)
                .message("قلم لغو شد")
                .data(shoppingService.cancel(currentUsername(), itemId))
                .build());
    }

    /** حذف قلم */
    @DeleteMapping("/{itemId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<ShoppingResponse> delete(@PathVariable Long itemId) {
        shoppingService.delete(currentUsername(), itemId);
        return ResponseEntity.ok(ShoppingResponse.builder()
                .success(true)
                .message("قلم از لیست خرید حذف شد")
                .data(null)
                .build());
    }

    /** آمار لیست خرید */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<ShoppingResponse> getStatistics() {
        return ResponseEntity.ok(ShoppingResponse.builder()
                .success(true)
                .message("آمار لیست خرید")
                .data(shoppingService.getStatistics(currentUsername()))
                .build());
    }
}
