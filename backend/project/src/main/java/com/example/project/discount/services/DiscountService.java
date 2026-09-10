package com.example.project.discount.services;

import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.discount.dto.DiscountCodeDto;
import com.example.project.discount.dto.DiscountCodeRequest;
import com.example.project.discount.dto.TourSpecialDiscountDto;
import com.example.project.discount.dto.TourSpecialDiscountRequest;

import java.math.BigDecimal;
import java.util.List;

public interface DiscountService {

    // ============ تور ویژه (فلش‌سیل) ============

    /** ایجاد تخفیف ویژه روی یک تور (فقط مدیر آژانس صاحب تور) */
    TourSpecialDiscountDto createSpecial(String ceoUsername, TourSpecialDiscountRequest request);

    /** تخفیف‌های ویژه فعال برای کاربران (صفحه تورهای ویژه) */
    List<TourSpecialDiscountDto> getActiveSpecials();

    /** تخفیف‌های ویژه تورهای یک آژانس */
    List<TourSpecialDiscountDto> getCeoSpecials(String ceoUsername);

    /** همه تخفیف‌های ویژه (مانیتورینگ ادمین) */
    List<TourSpecialDiscountDto> getAllSpecials();

    /** فعال/غیرفعال کردن */
    TourSpecialDiscountDto toggleSpecial(Long id, boolean active);

    void deleteSpecial(Long id);

    /** قیمت واحد مؤثر تور با اعمال تخفیف ویژه فعال (در غیر این صورت قیمت اصلی) */
    BigDecimal getEffectiveUnitPrice(Tour tour);

    /** درصد تخفیف ویژه فعال یک تور (در غیر این صورت null) */
    Integer getActiveSpecialPercent(Long tourId);

    // ============ کد تخفیف ============

    /** ساخت کد تخفیف — اگر forUserUsername تنظیم باشد، کد به اینباکس کاربر ارسال می‌شود */
    DiscountCodeDto createCode(String creatorUsername, String role, DiscountCodeRequest request);

    List<DiscountCodeDto> getCeoCodes(String ceoUsername);

    List<DiscountCodeDto> getAllCodes();

    DiscountCodeDto toggleCode(Long id, boolean active);

    void deleteCode(Long id);

    /**
     * اعتبارسنجی و اعمال کد تخفیف برای یک کاربر:
     * قیمت پایه را گرفته و قیمت تخفیف‌خورده برمی‌گرداند + usedCount را افزایش می‌دهد.
     */
    BigDecimal applyCode(String code, String username, BigDecimal basePrice);

    /**
     * اعتبارسنجی کد بدون مصرف — درصد تخفیف را برمی‌گرداند یا خطا می‌دهد.
     * (برای دکمه «بررسی کد» در صفحه رزرو)
     */
    Integer validateCode(String code, String username);
}
