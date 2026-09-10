package com.example.project.inbox.services;

import com.example.project.inbox.dto.InboxMessageResponse;
import com.example.project.inbox.dto.InboxSendRequest;
import com.example.project.inbox.dto.InboxStatsResponse;
import com.example.project.inbox.model.InboxMessageType;

import java.util.List;

public interface InboxService {

    /** لیست پیام‌های اینباکس کاربر جاری — جدیدترین اول */
    List<InboxMessageResponse> getMyInbox(String username);

    /** آمار اینباکس (کل + نخوانده) */
    InboxStatsResponse getStats(String username);

    /** علامت‌گذاری یک پیام به‌عنوان خوانده‌شده (فقط گیرنده) */
    InboxMessageResponse markRead(String username, Long messageId);

    /** علامت‌گذاری همه پیام‌ها به‌عنوان خوانده‌شده — تعداد تغییر یافته */
    int markAllRead(String username);

    /** تعداد پیام‌های نخوانده */
    long getUnreadCount(String username);

    /** ارسال پیام خصوصی از سمت ادمین/سوپرادمین */
    InboxMessageResponse sendPrivateMessage(String senderUsername, InboxSendRequest request);

    /** رفع تعلیق حساب توسط ادمین/سوپرادمین + اطلاع‌رسانی */
    InboxMessageResponse unsuspend(String adminUsername, Long userId);

    /** لیست کاربران معلق برای مدیریت رفع تعلیق */
    List<com.example.project.users.dto.UserDto> getSuspendedUsers();

    /** تاریخچه همه پیام‌های ارسال‌شده (برای پنل سوپرادمین) */
    List<com.example.project.inbox.dto.InboxHistoryResponse> getSendHistory();

    /**
     * ارسال پیام داخلی به اینباکس (استفاده توسط ماژول‌های دیگر مثل اخطار چت)
     */
    InboxMessageResponse sendToUser(String senderUsername, String senderRole,
                                    String recipientUsername, InboxMessageType type,
                                    String title, String content, Long referenceId);
}
