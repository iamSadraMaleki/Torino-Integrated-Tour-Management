package com.example.project.inbox.dto;

import lombok.*;

/**
 * آمار اینباکس برای نمایش بج پیام‌های نخوانده
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InboxStatsResponse {

    private long total;

    private long unread;
}
