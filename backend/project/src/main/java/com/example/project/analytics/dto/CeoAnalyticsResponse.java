package com.example.project.analytics.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.util.List;

/**
 * پاسخ تحلیل هوشمند داشبورد مدیر آژانس (CEO)
 */
@Value
@Builder
public class CeoAnalyticsResponse {

    /** درآمد ماهانه ۶ ماه اخیر (فقط رزروهای تأیید شده) */
    List<MoneyPoint> revenueByMonth;

    /** درآمد روزانه ۱۴ روز اخیر (فقط رزروهای تأیید شده) */
    List<MoneyPoint> revenueByDay;

    /** تعداد رزروهای ۱۴ روز اخیر */
    List<CountPoint> reservationsByDay;

    /** توزیع وضعیت رزروها */
    List<StatusSlice> statusDistribution;

    /** پرطرفدارترین تورها (۵ تای برتر بر اساس مسافر) */
    List<TopTour> topTours;

    int totalTours;
    int activeTours;
    int totalReservations;
    int confirmedReservations;
    BigDecimal totalRevenue;

    /** درصد تکمیل ظرفیت کل تورها (۰ تا ۱۰۰) */
    int occupancyRate;

    /** میانگین مبلغ هر رزرو تأیید شده */
    BigDecimal avgTicketPrice;

    /** پرفروش‌ترین تور */
    String bestTourName;

    /** پررونق‌ترین ماه از نظر درآمد */
    String busiestMonth;

    /** پررونق‌ترین روز از نظر تعداد رزرو */
    String busiestDay;

    @Value
    @Builder
    public static class MoneyPoint {
        String label;
        BigDecimal amount;
    }

    @Value
    @Builder
    public static class CountPoint {
        String label;
        long count;
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
    public static class TopTour {
        Long tourId;
        String tourName;
        String tourCode;
        long reservations;
        long passengers;
        BigDecimal revenue;
        /** درصد تکمیل ظرفیت این تور (۰ تا ۱۰۰) */
        int occupancyRate;
    }
}
