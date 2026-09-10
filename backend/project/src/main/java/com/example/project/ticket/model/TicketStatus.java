package com.example.project.ticket.model;

/**
 * وضعیت تیکت پشتیبانی
 */
public enum TicketStatus {
    OPEN("در حال بررسی"),
    IN_PROGRESS("در حال رسیدگی"),
    ANSWERED("پاسخ داده شد"),
    CLOSED("بسته شده");

    private final String persianName;

    TicketStatus(String persianName) {
        this.persianName = persianName;
    }

    public String getPersianName() {
        return persianName;
    }
}
