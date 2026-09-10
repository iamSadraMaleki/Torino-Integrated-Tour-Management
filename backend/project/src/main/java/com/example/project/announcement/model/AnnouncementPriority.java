package com.example.project.announcement.model;

/**
 * اولویت اطلاعیه‌های سراسری
 */
public enum AnnouncementPriority {
    LOW("کم"),
    MEDIUM("متوسط"),
    HIGH("بالا"),
    CRITICAL("بحرانی");

    private final String persianName;

    AnnouncementPriority(String persianName) {
        this.persianName = persianName;
    }

    public String getPersianName() {
        return persianName;
    }
}
