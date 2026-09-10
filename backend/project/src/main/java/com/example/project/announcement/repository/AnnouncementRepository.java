package com.example.project.announcement.repository;

import com.example.project.announcement.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    /** همه اطلاعیه‌ها: پین‌شده‌ها اول، بعد جدیدترین (برای تاریخچه ادمین) */
    List<Announcement> findAllByOrderByIsPinnedDescCreatedAtDesc();

    /** فقط اطلاعیه‌های فعال (مرتب‌سازی نهایی در سرویس انجام می‌شود) */
    List<Announcement> findByIsActiveTrue();
}
