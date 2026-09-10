package com.example.project.analytics.services;

import com.example.project.analytics.dto.AdminAnalyticsResponse;
import com.example.project.analytics.dto.CeoAnalyticsResponse;

public interface AnalyticsService {

    /** تحلیل هوشمند داشبورد مدیر آژانس */
    CeoAnalyticsResponse getCeoAnalytics(String username);

    /** تحلیل هوشمند داشبورد سوپرادمین (کل پلتفرم) */
    AdminAnalyticsResponse getAdminAnalytics();
}
