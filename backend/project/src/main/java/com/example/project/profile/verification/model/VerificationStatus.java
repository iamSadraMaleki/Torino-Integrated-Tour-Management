package com.example.project.profile.verification.model;

/**
 * وضعیت‌های احراز هویت CEO
 */
public enum VerificationStatus {
    NOT_VERIFIED("احراز نشده"),
    PENDING("در انتظار بررسی"),
    VERIFIED("تایید شد"),
    REJECTED("رد شد");

    private final String persianName;

    VerificationStatus(String persianName) {
        this.persianName = persianName;
    }

    public String getPersianName() {
        return persianName;
    }

    public boolean isFinalStatus() {
        return this == VERIFIED || this == REJECTED;
    }

    public boolean isEditable() {
        return this == NOT_VERIFIED || this == PENDING;
    }
}
