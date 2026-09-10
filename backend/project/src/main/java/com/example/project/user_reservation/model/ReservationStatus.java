package com.example.project.user_reservation.model;

public enum ReservationStatus {
    PENDING_PAYMENT("در انتظار پرداخت"),      // منتظر آپلود رسید
    WAITING_FOR_VERIFICATION("در انتظار تأیید"), // رسید آپلود شده، منتظر تأیید CEO
    CONFIRMED("تأیید شده"),                   // رزرو نهایی شده
    CANCELLED("لغو شده"),                     // لغو شده توسط کاربر یا خودکار
    REJECTED("رد شده");                       // رسید رد شده توسط CEO

    private final String persianName;

    ReservationStatus(String persianName) {
        this.persianName = persianName;
    }

    public String getPersianName() {
        return persianName;
    }
}