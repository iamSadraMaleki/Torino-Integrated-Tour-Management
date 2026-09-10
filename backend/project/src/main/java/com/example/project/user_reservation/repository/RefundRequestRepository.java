package com.example.project.user_reservation.repository;


import com.example.project.user_reservation.model.RefundRequest;
import com.example.project.user_reservation.model.RefundStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefundRequestRepository extends JpaRepository<RefundRequest, Long> {
    Optional<RefundRequest> findByReservationId(Long reservationId);

    // جدیدترین درخواست را برمی‌گرداند تا خطای NonUniqueResultException ندهد
    Optional<RefundRequest> findFirstByReservationIdOrderByIdDesc(Long reservationId);

    List<RefundRequest> findAllByStatus(RefundStatus status);
    List<RefundRequest> findAllByReservationTourCreatedById(Long ceoId);

    // دریافت درخواست‌های کنسلی برای تورهای یک CEO خاص
    @Query("SELECT r FROM RefundRequest r WHERE r.reservation.tour.createdBy.username = :ceoUsername ORDER BY r.createdAt DESC")
    List<RefundRequest> findAllByCeoUsername(@Param("ceoUsername") String ceoUsername);

    // فقط درخواست‌های PENDING برای یک CEO
    @Query("SELECT r FROM RefundRequest r WHERE r.reservation.tour.createdBy.username = :ceoUsername AND r.status = 'PENDING' ORDER BY r.createdAt DESC")
    List<RefundRequest> findAllPendingByCeoUsername(@Param("ceoUsername") String ceoUsername);

    // بررسی وجود درخواست کنسلی فعال برای یک رزرو
    @Query("SELECT COUNT(r) > 0 FROM RefundRequest r WHERE r.reservation.id = :reservationId AND r.status IN ('PENDING', 'REFUND_RECEIPT_UPLOADED')")
    boolean hasActiveRefundRequest(@Param("reservationId") Long reservationId);

    // دریافت درخواست فعال کنسلی برای یک رزرو
    @Query("SELECT r FROM RefundRequest r WHERE r.reservation.id = :reservationId AND r.status IN ('PENDING', 'REFUND_RECEIPT_UPLOADED')")
    Optional<RefundRequest> findActiveByReservationId(@Param("reservationId") Long reservationId);
}