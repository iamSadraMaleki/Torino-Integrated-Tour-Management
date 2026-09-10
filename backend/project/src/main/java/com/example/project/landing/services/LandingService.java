package com.example.project.landing.services;

import java.util.Map;

public interface LandingService {

    /** کلیدهای محتوای صفحه معرفی */
    String KEY_HERO = "HERO";
    String KEY_CITIES = "CITIES";
    String KEY_PLACES = "PLACES";
    String KEY_HOTELS = "HOTELS";
    String KEY_FOODS = "FOODS";
    String KEY_VEHICLES = "VEHICLES";

    /** همه محتوای صفحه معرفی (عمومی) */
    Map<String, String> getContent();

    /** به‌روزرسانی محتوای صفحه معرفی توسط ادمین */
    Map<String, String> updateContent(Map<String, String> content);

    /** بازنشانی به مقادیر پیش‌فرض */
    Map<String, String> restoreDefaults();

    /** مقدار پیش‌فرض برای یک کلید (از فایل resources/landing-defaults.json) */
    String getDefaultValue(String key);
}
