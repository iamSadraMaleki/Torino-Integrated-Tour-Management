package com.example.project.finance.model;

public enum SettlementStatus {
    PENDING("در انتظار بررسی"),
    APPROVED("تأیید شده"),
    REJECTED("رد شده");

    private final String persianName;

    SettlementStatus(String persianName) {
        this.persianName = persianName;
    }

    public String getPersianName() {
        return persianName;
    }
}
