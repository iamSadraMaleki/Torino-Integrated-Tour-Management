package com.example.project.tour_chat.services;

import com.example.project.tour_chat.dto.*;

import java.util.List;

public interface TourChatService {

    /** شروع گفتگو با مدیر آژانس برای یک تور (ایجاد یا بازیابی گفتگوی موجود) */
    TourConversationResponse startConversation(String username, Long tourId);

    /** لیست گفتگوهای من (مسافر یا مدیر آژانس بر اساس نقش) — به‌همراه تعداد پیام‌های نخوانده */
    List<TourConversationResponse> getConversations(String username);

    /** جزئیات یک گفتگو (فقط شرکت‌کننده) */
    TourConversationResponse getConversation(String username, Long conversationId);

    /** پیام‌های گفتگو (خواندن = علامت‌گذاری به‌عنوان خوانده‌شده برای اینباکس) */
    List<TourChatMessageResponse> getMessages(String username, Long conversationId);

    /** ارسال پیام */
    TourChatMessageResponse sendMessage(String username, Long conversationId, TourChatSendRequest request);

    /** ویرایش پیام خود (فقط فرستنده) */
    TourChatMessageResponse editMessage(String username, Long messageId, TourChatEditRequest request);

    /** حذف نرم پیام خود (فقط فرستنده) — برای مانیتورینگ امنیتی محتوا حفظ می‌شود */
    void deleteMessage(String username, Long messageId);

    /** اخطارهای صادرشده برای کاربر جاری (نمایش در اینباکس) */
    List<ChatWarningResponse> getMyWarnings(String username);

    // ===================== سمت سوپرادمین/ادمین =====================

    /** همه پیام‌های چت برای مانیتورینگ — جدول: متن، فرستنده، گیرنده، تاریخ */
    List<AdminTourChatMessageResponse> getAdminMonitorMessages();

    /** صدور اخطار برای پیام نامرتبط */
    ChatWarningResponse warnMessage(String adminUsername, ChatWarningRequest request);
}
