package com.example.project.ceo_personel.payment.controller;

import com.example.project.ceo_personel.dto.StaffResponse;
import com.example.project.ceo_personel.payment.dto.StaffPaymentRequest;
import com.example.project.ceo_personel.payment.dto.StaffPaymentResponse;
import com.example.project.ceo_personel.payment.dto.StaffPaymentStatsResponse;
import com.example.project.ceo_personel.payment.services.StaffPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * دفتر پرداخت حقوق کارکنان — ثبت حقوق/پاداش و آمار پرداختی (فقط مدیر آژانس)
 */
@RestController
@RequestMapping("/api/ceo/staff/payments")
@RequiredArgsConstructor
public class StaffPaymentController {

    private final StaffPaymentService paymentService;

    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    /** ثبت پرداخت (حقوق/پاداش) به یک کارمند */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> recordPayment(@Valid @RequestBody StaffPaymentRequest request) {
        StaffPaymentResponse data = paymentService.recordPayment(currentUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(StaffResponse.builder()
                        .success(true)
                        .message("پرداخت با موفقیت ثبت شد")
                        .data(data)
                        .build());
    }

    /** همه پرداخت‌های کارمندان */
    @GetMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> getPayments() {
        List<StaffPaymentResponse> data = paymentService.getPayments(currentUsername());
        return ResponseEntity.ok(StaffResponse.builder()
                .success(true)
                .message("لیست پرداخت‌ها")
                .data(data)
                .build());
    }

    /** پرداخت‌های یک کارمند خاص */
    @GetMapping("/staff/{staffId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> getPaymentsByStaff(@PathVariable Long staffId) {
        List<StaffPaymentResponse> data = paymentService.getPaymentsByStaff(currentUsername(), staffId);
        return ResponseEntity.ok(StaffResponse.builder()
                .success(true)
                .message("پرداخت‌های کارمند")
                .data(data)
                .build());
    }

    /** آمار پرداخت‌ها (کل + به تفکیک کارمند + به تفکیک ماه) */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> getStatistics() {
        StaffPaymentStatsResponse data = paymentService.getStatistics(currentUsername());
        return ResponseEntity.ok(StaffResponse.builder()
                .success(true)
                .message("آمار پرداختی کارکنان")
                .data(data)
                .build());
    }

    /** حذف یک پرداخت */
    @DeleteMapping("/{paymentId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> deletePayment(@PathVariable Long paymentId) {
        paymentService.deletePayment(currentUsername(), paymentId);
        return ResponseEntity.ok(StaffResponse.builder()
                .success(true)
                .message("پرداخت حذف شد")
                .data(null)
                .build());
    }
}
