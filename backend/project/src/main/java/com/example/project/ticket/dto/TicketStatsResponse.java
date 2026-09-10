package com.example.project.ticket.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketStatsResponse {

    private long total;
    private long open;
    private long inProgress;
    private long answered;
    private long closed;

    /** نام اولویت → تعداد */
    private Map<String, Long> byPriority;

    /** آخرین ۷ روز: {date: "2026-08-04", count: n} */
    private List<DailyCount> last7Days;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyCount {
        private String date;
        private long count;
    }
}
