package com.example.project.announcement.model;

/**
 * مخاطب اطلاعیه: همه کاربران، فقط آژانس‌ها، فقط مسافران یا بر اساس شهر
 */
public enum AnnouncementAudience {
    ALL("همه کاربران"),
    AGENCIES("فقط آژانس‌ها"),
    PASSENGERS("فقط مسافران"),
    CITY("بر اساس شهر");

    private final String persianName;

    AnnouncementAudience(String persianName) {
        this.persianName = persianName;
    }

    public String getPersianName() {
        return persianName;
    }
}
