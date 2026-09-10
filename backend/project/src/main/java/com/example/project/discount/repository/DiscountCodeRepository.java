package com.example.project.discount.repository;

import com.example.project.discount.model.DiscountCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DiscountCodeRepository extends JpaRepository<DiscountCode, Long> {

    Optional<DiscountCode> findByCode(String code);

    /** کدهای ساخته‌شده توسط یک کاربر (مدیر آژانس) */
    List<DiscountCode> findByCreatedByUsernameOrderByCreatedAtDesc(String username);

    /** همه کدها برای مانیتورینگ ادمین */
    @Query("SELECT c FROM DiscountCode c ORDER BY c.createdAt DESC")
    List<DiscountCode> findAllOrderByCreatedAtDesc();
}
