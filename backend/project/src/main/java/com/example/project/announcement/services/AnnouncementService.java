package com.example.project.announcement.services;

import com.example.project.announcement.dto.AnnouncementCreateRequest;
import com.example.project.announcement.dto.AnnouncementResponse;

import java.util.List;

public interface AnnouncementService {

    /** ساخت اطلاعیه جدید توسط ادمین */
    AnnouncementResponse create(String adminUsername, AnnouncementCreateRequest request);

    /** لیست کامل تاریخچه اطلاعیه‌ها (برای ادمین) */
    List<AnnouncementResponse> getAll();

    /** اطلاعیه‌های فعال برای یک کاربر خاص (با فیلتر مخاطب و شهر) */
    List<AnnouncementResponse> getActiveForUser(String username);

    /** پین/آنپین کردن اطلاعیه */
    AnnouncementResponse togglePin(Long id);

    /** فعال/غیرفعال کردن اطلاعیه */
    AnnouncementResponse toggleActive(Long id);

    /** حذف اطلاعیه */
    void delete(Long id);
}
