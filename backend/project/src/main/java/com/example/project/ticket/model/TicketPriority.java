package com.example.project.ticket.model;

/**
 * اولویت تیکت پشتیبانی
 */
public enum TicketPriority {
    LOW("کم"),
    MEDIUM("متوسط"),
    HIGH("بالا"),
    CRITICAL("بحرانی");

    private final String persianName;

    TicketPriority(String persianName) {
        this.persianName = persianName;
    }

    public String getPersianName() {
        return persianName;
    }
}
