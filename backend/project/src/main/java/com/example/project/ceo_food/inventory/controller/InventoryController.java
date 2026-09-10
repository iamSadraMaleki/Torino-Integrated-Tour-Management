package com.example.project.ceo_food.inventory.controller;

import com.example.project.ceo_food.inventory.dto.InventoryItemRequest;
import com.example.project.ceo_food.inventory.dto.InventoryResponse;
import com.example.project.ceo_food.inventory.services.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * انبار مواد اولیه — مدیریت موجودی اقلام (فقط مدیر آژانس)
 */
@RestController
@RequestMapping("/api/ceo/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    /** ثبت قلم جدید */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<InventoryResponse> create(@Valid @RequestBody InventoryItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(InventoryResponse.builder()
                        .success(true)
                        .message("قلم با موفقیت به انبار اضافه شد")
                        .data(inventoryService.create(currentUsername(), request))
                        .build());
    }

    /** همه اقلام انبار */
    @GetMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<InventoryResponse> getAll() {
        return ResponseEntity.ok(InventoryResponse.builder()
                .success(true)
                .message("لیست اقلام انبار")
                .data(inventoryService.getAll(currentUsername()))
                .build());
    }

    /** یک قلم */
    @GetMapping("/{itemId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<InventoryResponse> getById(@PathVariable Long itemId) {
        return ResponseEntity.ok(InventoryResponse.builder()
                .success(true)
                .message("قلم انبار")
                .data(inventoryService.getById(currentUsername(), itemId))
                .build());
    }

    /** ویرایش قلم */
    @PutMapping("/{itemId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<InventoryResponse> update(
            @PathVariable Long itemId,
            @Valid @RequestBody InventoryItemRequest request) {
        return ResponseEntity.ok(InventoryResponse.builder()
                .success(true)
                .message("قلم با موفقیت ویرایش شد")
                .data(inventoryService.update(currentUsername(), itemId, request))
                .build());
    }

    /** تغییر موجودی (دلتا) — مثبت اضافه، منفی کم */
    @PatchMapping("/{itemId}/adjust")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<InventoryResponse> adjust(
            @PathVariable Long itemId,
            @RequestBody AdjustRequest request) {
        return ResponseEntity.ok(InventoryResponse.builder()
                .success(true)
                .message("موجودی با موفقیت تغییر کرد")
                .data(inventoryService.adjustQuantity(currentUsername(), itemId, request.getDelta()))
                .build());
    }

    /** حذف قلم */
    @DeleteMapping("/{itemId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<InventoryResponse> delete(@PathVariable Long itemId) {
        inventoryService.delete(currentUsername(), itemId);
        return ResponseEntity.ok(InventoryResponse.builder()
                .success(true)
                .message("قلم از انبار حذف شد")
                .data(null)
                .build());
    }

    /** آمار انبار */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<InventoryResponse> getStatistics() {
        return ResponseEntity.ok(InventoryResponse.builder()
                .success(true)
                .message("آمار انبار")
                .data(inventoryService.getStatistics(currentUsername()))
                .build());
    }

    public static class AdjustRequest {
        private BigDecimal delta;
        public BigDecimal getDelta() { return delta; }
        public void setDelta(BigDecimal delta) { this.delta = delta; }
    }
}
