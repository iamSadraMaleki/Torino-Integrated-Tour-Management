package com.example.project.user_reservation.repository;


import com.example.project.user_reservation.model.Reservation;
import com.example.project.user_reservation.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // دریافت رزروهای یک کاربر
    List<Reservation> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    // دریافت رزروهای یک تور
    List<Reservation> findAllByTourId(Long tourId);

    // دریافت رزرو با ID و کاربر (برای امنیت)
    Optional<Reservation> findByIdAndUserId(Long id, Long userId);

    // رزروهای منقضی شده (برای کرون جاب)
    List<Reservation> findAllByStatusAndExpiresAtBefore(ReservationStatus status, LocalDateTime now);

    // رزروهای یک تور با وضعیت CONFIRMED (برای محاسبه ظرفیت پر شده)
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.tour.id = :tourId AND r.status = 'CONFIRMED'")
    long countConfirmedByTourId(@Param("tourId") Long tourId);

    // به‌روزرسانی وضعیت رزروهای منقضی شده به CANCELLED (شامل PENDING_PAYMENT و WAITING_FOR_VERIFICATION)
    @Modifying
    @Query("UPDATE Reservation r SET r.status = 'CANCELLED' WHERE r.status IN ('PENDING_PAYMENT', 'WAITING_FOR_VERIFICATION') AND r.expiresAt < :now")
    int expirePendingReservations(@Param("now") LocalDateTime now);

    @Query("SELECT r FROM Reservation r WHERE r.tour.createdBy.username = :ceoUsername")
    List<Reservation> findAllByTourCreatedByUsername(@Param("ceoUsername") String ceoUsername);

    @Query("SELECT r FROM Reservation r WHERE r.tour.createdBy.username = :ceoUsername AND r.status = 'WAITING_FOR_VERIFICATION'")
    List<Reservation> findAllWaitingForVerificationByCeoUsername(@Param("ceoUsername") String ceoUsername);

    @Query("SELECT COALESCE(SUM(r.passengerCount), 0) FROM Reservation r WHERE r.tour.createdBy.username = :ceoUsername AND r.status = 'CONFIRMED'")
    long sumConfirmedPassengersByCeoUsername(@Param("ceoUsername") String ceoUsername);

    @Query("SELECT COALESCE(SUM(r.totalPrice), 0) FROM Reservation r WHERE r.tour.createdBy.username = :ceoUsername AND r.status = 'CONFIRMED'")
    java.math.BigDecimal sumConfirmedRevenueByCeoUsername(@Param("ceoUsername") String ceoUsername);

    @Query("SELECT COUNT(DISTINCT r.user.id) FROM Reservation r WHERE r.tour.createdBy.username = :ceoUsername AND r.status = 'CONFIRMED'")
    long countUniqueCustomersByCeoUsername(@Param("ceoUsername") String ceoUsername);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.tour.createdBy.username = :ceoUsername AND r.status = 'CONFIRMED'")
    long countConfirmedByCeoUsername(@Param("ceoUsername") String ceoUsername);

    /** آیا کاربر در این تور رزرو تأییدشده با تاریخ حرکت گذشته دارد؟ (برای ثبت نظر) */
    @Query("SELECT COUNT(r) > 0 FROM Reservation r WHERE r.user.id = :userId AND r.tour.id = :tourId AND r.status = 'CONFIRMED' AND r.tour.departureDate < :today")
    boolean hasConfirmedPastTravel(@Param("userId") Long userId, @Param("tourId") Long tourId, @Param("today") LocalDate today);

}