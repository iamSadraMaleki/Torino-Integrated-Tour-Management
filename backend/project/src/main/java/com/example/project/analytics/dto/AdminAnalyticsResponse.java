package com.example.project.analytics.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.util.List;

/**
 * پاسخ تحلیل هوشمند داشبورد سوپرادمین (کل پلتفرم)
 */
@Value
@Builder
public class AdminAnalyticsResponse {

    /** تعداد رزروهای کل پلتفرم در ۱۴ روز اخیر */
    List<CountPoint> reservationsByDay;

    /** درآمد کل پلتفرم در ۶ ماه اخیر (رزروهای تأیید شده) */
    List<MoneyPoint> revenueByMonth;

    /** تعداد تورهای ایجادشده در ۶ ماه اخیر */
    List<CountPoint> toursByMonth;

    /** توزیع وضعیت رزروها در کل پلتفرم */
    List<StatusSlice> reservationStatusDistribution;

    /** توزیع نقش‌های کاربران */
    List<RoleSlice> roleDistribution;

    /** برترین آژانس‌ها (۵ تای برتر بر اساس درآمد) */
    List<TopAgency> topAgencies;

    PlatformTotals totals;

    @Value
    @Builder
    public static class CountPoint {
        String label;
        long count;
    }

    @Value
    @Builder
    public static class MoneyPoint {
        String label;
        BigDecimal amount;
    }

    @Value
    @Builder
    public static class StatusSlice {
        String status;
        String persianName;
        long count;
    }

    @Value
    @Builder
    public static class RoleSlice {
        String role;
        String persianName;
        long count;
    }

    @Value
    @Builder
    public static class TopAgency {
        String username;
        String agencyName;
        long reservations;
        long passengers;
        BigDecimal revenue;
    }

    @Value
    @Builder
    public static class PlatformTotals {
        long totalUsers;
        long totalCeos;
        long totalTours;
        long totalReservations;
        long confirmedReservations;
        BigDecimal totalRevenue;
        long pendingVerifications;
    }
}
