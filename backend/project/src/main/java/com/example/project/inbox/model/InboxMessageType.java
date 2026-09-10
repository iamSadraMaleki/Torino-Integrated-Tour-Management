package com.example.project.inbox.model;

/**
 * نوع پیام اینباکس — برای نمایش آیکون و رنگ مناسب
 */
public enum InboxMessageType {
    /** پیام سیستمی */
    SYSTEM,
    /** پیام خصوصی از سوپرادمین/ادمین */
    ADMIN,
    /** اخطار صادرشده برای پیام نامرتبط */
    WARNING,
    /** اطلاع‌رسانی تعلیق حساب */
    SUSPENSION,
    /** اطلاع‌رسانی رفع تعلیق حساب */
    UNSUSPENSION
}
