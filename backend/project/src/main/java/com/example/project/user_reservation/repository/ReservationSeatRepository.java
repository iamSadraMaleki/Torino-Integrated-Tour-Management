package com.example.project.user_reservation.repository;

import com.example.project.user_reservation.model.ReservationSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface ReservationSeatRepository extends JpaRepository<ReservationSeat, Long> {
    List<ReservationSeat> findAllByReservationId(Long reservationId);

    // گرفتن همه صندلی‌های رزرو شده برای یک تور (برای نمایش صندلی‌های پر شده)
    @Query("SELECT rs.seat.id FROM ReservationSeat rs WHERE rs.tourId = :tourId AND rs.reservation.status IN ('PENDING_PAYMENT', 'WAITING_FOR_VERIFICATION', 'CONFIRMED')")
    Set<Long> findBookedSeatIdsByTourId(@Param("tourId") Long tourId);

    // گرفتن همه صندلی‌های یک رزرو خاص
    @Query("SELECT rs.seat.id FROM ReservationSeat rs WHERE rs.reservation.id = :reservationId")
    Set<Long> findSeatIdsByReservationId(@Param("reservationId") Long reservationId);

    // صندلی‌های یک رزرو به ترتیب ثبت (برای بلیط — هر مسافر به ترتیب یک صندلی دارد)
    @Query("SELECT rs.seat.id FROM ReservationSeat rs WHERE rs.reservation.id = :reservationId ORDER BY rs.id")
    List<Long> findSeatIdsByReservationIdOrdered(@Param("reservationId") Long reservationId);

    @Modifying
    @Query("DELETE FROM ReservationSeat rs WHERE rs.reservation.id = :reservationId")
    void deleteAllByReservationId(@Param("reservationId") Long reservationId);

    // حذف یک صندلی خاص از یک رزرو (برای لغو انتخابی)
    @Modifying
    @Query("DELETE FROM ReservationSeat rs WHERE rs.seat.id = :seatId AND rs.reservation.id = :reservationId")
    void deleteBySeatIdAndReservationId(@Param("seatId") Long seatId, @Param("reservationId") Long reservationId);

    // گرفتن وضعیت رزرو برای هر صندلی (برای تعیین PENDING/CONFIRMED)
    @Query("SELECT rs.seat.id, rs.reservation.status FROM ReservationSeat rs WHERE rs.tourId = :tourId AND rs.reservation.status IN ('PENDING_PAYMENT', 'WAITING_FOR_VERIFICATION', 'CONFIRMED')")
    List<Object[]> findSeatReservationStatusByTourId(@Param("tourId") Long tourId);
}