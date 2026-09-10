package com.example.project.finance.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.finance.dto.CeoSettlementSummaryDto;
import com.example.project.finance.dto.SettlementRequestCreateRequest;
import com.example.project.finance.dto.SettlementRequestDto;
import com.example.project.finance.services.FinanceService;
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
@RequestMapping("/api/ceo/finance")
@RequiredArgsConstructor
public class CeoFinanceController {

    private final FinanceService financeService;
    private final SecurityUtils securityUtils;

    /** خلاصه موجودی و تسویه مدیر آژانس */
    @GetMapping("/settlement/summary")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<ApiResponse<CeoSettlementSummaryDto>> getSummary() {
        CeoSettlementSummaryDto data = financeService.getMySettlementSummary(securityUtils.currentUsername());
        return ResponseEntity.ok(ApiResponse.ok("خلاصه تسویه حساب", data));
    }

    /** ثبت درخواست تسویه */
    @PostMapping("/settlement/requests")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<ApiResponse<SettlementRequestDto>> create(
            @Valid @RequestBody SettlementRequestCreateRequest request) {
        SettlementRequestDto data = financeService.createSettlementRequest(securityUtils.currentUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("درخواست تسویه ثبت شد", data));
    }

    /** تاریخچه تسویه‌های من */
    @GetMapping("/settlement/requests")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<ApiResponse<List<SettlementRequestDto>>> getMyRequests() {
        List<SettlementRequestDto> data = financeService.getMySettlementRequests(securityUtils.currentUsername());
        return ResponseEntity.ok(ApiResponse.ok("تاریخچه تسویه‌ها", data));
    }
}
