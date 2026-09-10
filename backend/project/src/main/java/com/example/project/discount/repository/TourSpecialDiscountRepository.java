package com.example.project.discount.repository;

import com.example.project.discount.model.TourSpecialDiscount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TourSpecialDiscountRepository extends JpaRepository<TourSpecialDiscount, Long> {

    /** تخفیف‌های فعال و هنوز منقضی‌نشده (برای صفحه تورهای ویژه کاربر) */
    @Query("SELECT d FROM TourSpecialDiscount d WHERE d.isActive = true AND d.expiresAt > :now ORDER BY d.createdAt DESC")
    List<TourSpecialDiscount> findActiveAndNotExpired(@Param("now") LocalDateTime now);

    /** تخفیف‌های تورهای یک آژانس (مدیر آژانس) */
    List<TourSpecialDiscount> findByTourCreatedByUsernameOrderByCreatedAtDesc(String username);

    /** همه تخفیف‌ها برای مانیتورینگ ادمین */
    @Query("SELECT d FROM TourSpecialDiscount d ORDER BY d.createdAt DESC")
    List<TourSpecialDiscount> findAllOrderByCreatedAtDesc();

    Optional<TourSpecialDiscount> findByTourIdAndIsActiveTrueAndExpiresAtAfter(Long tourId, LocalDateTime now);

    boolean existsByTourIdAndIsActiveTrueAndExpiresAtAfter(Long tourId, LocalDateTime now);
}
