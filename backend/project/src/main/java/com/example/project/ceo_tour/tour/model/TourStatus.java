package com.example.project.ceo_tour.tour.model;

public enum TourStatus {
    ACTIVE("فعال"),
    EXPIRED("منقضی شده"),
    SOLD_OUT("اتمام ظرفیت"),
    SUSPENDED("تعلیق");

    private final String persianName;

    TourStatus(String persianName) {
        this.persianName = persianName;
    }

    public String getPersianName() {
        return persianName;
    }
}
