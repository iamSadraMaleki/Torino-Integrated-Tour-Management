package com.example.project.ceo_personel.payment.repository;

import com.example.project.ceo_personel.payment.model.StaffPayment;
import com.example.project.ceo_personel.payment.model.StaffPaymentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StaffPaymentRepository extends JpaRepository<StaffPayment, Long> {

    /** همه پرداخت‌های کارمندان یک مدیر آژانس — جدیدترین اول */
    @Query("SELECT p FROM StaffPayment p WHERE p.staffMember.user.id = :userId ORDER BY p.paymentDate DESC, p.id DESC")
    List<StaffPayment> findAllByUserId(@Param("userId") Long userId);

    /** پرداخت‌های یک کارمند خاص (برای مدیر آژانس صاحب کارمند) */
    @Query("SELECT p FROM StaffPayment p WHERE p.staffMember.id = :staffId AND p.staffMember.user.id = :userId ORDER BY p.paymentDate DESC, p.id DESC")
    List<StaffPayment> findByStaffIdAndUserId(@Param("staffId") Long staffId, @Param("userId") Long userId);

    /** مجموع پرداخت‌های یک مدیر آژانس */
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM StaffPayment p WHERE p.staffMember.user.id = :userId")
    java.math.BigDecimal sumByUserId(@Param("userId") Long userId);

    /** مجموع پرداخت‌های یک مدیر آژانس بر اساس نوع */
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM StaffPayment p WHERE p.staffMember.user.id = :userId AND p.paymentType = :type")
    java.math.BigDecimal sumByUserIdAndType(@Param("userId") Long userId, @Param("type") StaffPaymentType type);

    /** مجموع پرداخت هر کارمند (برای آمار) */
    @Query("SELECT p.staffMember.id, p.staffMember.fullName, COALESCE(SUM(p.amount), 0), COUNT(p) " +
            "FROM StaffPayment p WHERE p.staffMember.user.id = :userId GROUP BY p.staffMember.id, p.staffMember.fullName ORDER BY SUM(p.amount) DESC")
    List<Object[]> sumPerStaff(@Param("userId") Long userId);

    /** مجموع پرداخت هر کارمند بر اساس نوع (برای آمار) */
    @Query("SELECT p.staffMember.id, p.paymentType, COALESCE(SUM(p.amount), 0) " +
            "FROM StaffPayment p WHERE p.staffMember.user.id = :userId GROUP BY p.staffMember.id, p.paymentType")
    List<Object[]> sumPerStaffByType(@Param("userId") Long userId);

    /** مجموع پرداخت‌ها به تفکیک ماه (برای نمودار/جدول ماهانه) */
    @Query("SELECT FUNCTION('to_char', p.paymentDate, 'YYYY-MM'), COALESCE(SUM(p.amount), 0), COUNT(p) " +
            "FROM StaffPayment p WHERE p.staffMember.user.id = :userId GROUP BY FUNCTION('to_char', p.paymentDate, 'YYYY-MM') ORDER BY FUNCTION('to_char', p.paymentDate, 'YYYY-MM') DESC")
    List<Object[]> sumByMonth(@Param("userId") Long userId);
}
