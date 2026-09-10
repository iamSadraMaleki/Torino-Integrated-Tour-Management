package com.example.project.finance.services;

import com.example.project.finance.dto.*;

import java.util.List;

public interface FinanceService {

    // ============ سوپرادمین ============

    /** همه تراکنش‌های پرداخت کل پلتفرم */
    List<FinanceTransactionDto> getTransactions();

    /** گزارش درآمد هر آژانس با محاسبه کمیسیون */
    List<AgencyRevenueDto> getAgencyRevenueReport();

    /** خلاصه مالی کل پلتفرم */
    FinanceSummaryDto getFinanceSummary();

    /** همه درخواست‌های تسویه */
    List<SettlementRequestDto> getAllSettlementRequests();

    /** تأیید تسویه */
    SettlementRequestDto approveSettlement(Long requestId, String adminUsername);

    /** رد تسویه */
    SettlementRequestDto rejectSettlement(Long requestId, String adminUsername, String reason);

    /** لیست تنظیمات کمیسیون آژانس‌ها */
    List<CommissionConfigDto> getCommissionConfigs();

    /** تنظیم/به‌روزرسانی کمیسیون یک آژانس */
    CommissionConfigDto upsertCommission(Long agencyId, CommissionConfigRequest request, String adminUsername);

    // ============ مدیر آژانس (تسویه) ============

    CeoSettlementSummaryDto getMySettlementSummary(String username);

    SettlementRequestDto createSettlementRequest(String username, SettlementRequestCreateRequest request);

    List<SettlementRequestDto> getMySettlementRequests(String username);
}
