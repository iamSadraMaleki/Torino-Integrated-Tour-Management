package com.example.project.finance.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.finance.dto.*;
import com.example.project.finance.services.FinanceService;
import com.example.project.users.config.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin/finance")
@RequiredArgsConstructor
public class AdminFinanceController {

    private final FinanceService financeService;
    private final SecurityUtils securityUtils;

    /** خلاصه مالی کل پلتفرم */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<ApiResponse<FinanceSummaryDto>> getSummary() {
        return ResponseEntity.ok(ApiResponse.ok("خلاصه مالی پلتفرم", financeService.getFinanceSummary()));
    }

    /** همه تراکنش‌های پرداخت */
    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<ApiResponse<List<FinanceTransactionDto>>> getTransactions() {
        return ResponseEntity.ok(ApiResponse.ok("لیست تراکنش‌ها", financeService.getTransactions()));
    }

    /** گزارش درآمد آژانس‌ها */
    @GetMapping("/agency-revenue")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<ApiResponse<List<AgencyRevenueDto>>> getAgencyRevenue() {
        return ResponseEntity.ok(ApiResponse.ok("گزارش درآمد آژانس‌ها", financeService.getAgencyRevenueReport()));
    }

    /** همه درخواست‌های تسویه */
    @GetMapping("/settlement-requests")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<ApiResponse<List<SettlementRequestDto>>> getSettlementRequests() {
        return ResponseEntity.ok(ApiResponse.ok("لیست درخواست‌های تسویه", financeService.getAllSettlementRequests()));
    }

    /** تأیید تسویه */
    @PutMapping("/settlement-requests/{requestId}/approve")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<ApiResponse<SettlementRequestDto>> approve(@PathVariable Long requestId) {
        SettlementRequestDto data = financeService.approveSettlement(requestId, securityUtils.currentUsername());
        return ResponseEntity.ok(ApiResponse.ok("تسویه تأیید شد", data));
    }

    /** رد تسویه */
    @PutMapping("/settlement-requests/{requestId}/reject")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<ApiResponse<SettlementRequestDto>> reject(
            @PathVariable Long requestId,
            @RequestParam String reason) {
        SettlementRequestDto data = financeService.rejectSettlement(requestId, securityUtils.currentUsername(), reason);
        return ResponseEntity.ok(ApiResponse.ok("تسویه رد شد", data));
    }

    /** لیست تنظیمات کمیسیون */
    @GetMapping("/commissions")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<ApiResponse<List<CommissionConfigDto>>> getCommissions() {
        return ResponseEntity.ok(ApiResponse.ok("لیست کمیسیون‌ها", financeService.getCommissionConfigs()));
    }

    /** تنظیم کمیسیون یک آژانس */
    @PutMapping("/commissions/agency/{agencyId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<ApiResponse<CommissionConfigDto>> upsertCommission(
            @PathVariable Long agencyId,
            @Valid @RequestBody CommissionConfigRequest request) {
        CommissionConfigDto data = financeService.upsertCommission(agencyId, request, securityUtils.currentUsername());
        return ResponseEntity.ok(ApiResponse.ok("کمیسیون آژانس تنظیم شد", data));
    }
}
