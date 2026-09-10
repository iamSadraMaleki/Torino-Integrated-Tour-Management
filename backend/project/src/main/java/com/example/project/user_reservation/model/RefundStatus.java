package com.example.project.user_reservation.model;

public enum RefundStatus {
    PENDING("در انتظار بررسی"),              // کاربر درخواست داده، منتظر CEO
    REFUND_RECEIPT_UPLOADED("رسید برگشت آپلود شد"), // CEO رسید برگشت رو آپلود کرده، منتظر تایید مشتری
    CONFIRMED("تأیید نهایی"),                // مشتری تایید کرده، رزرو لغو شده
    REJECTED("رد شده");                       // CEO درخواست رو رد کرده

    private final String persianName;

    RefundStatus(String persianName) {
        this.persianName = persianName;
    }

    public String getPersianName() {
        return persianName;
    }
}