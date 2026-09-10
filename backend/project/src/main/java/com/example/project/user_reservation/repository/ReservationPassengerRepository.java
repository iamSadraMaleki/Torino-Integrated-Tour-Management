package com.example.project.user_reservation.repository;

import com.example.project.user_reservation.model.ReservationPassenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationPassengerRepository extends JpaRepository<ReservationPassenger, Long> {
    List<ReservationPassenger> findAllByReservationId(Long reservationId);
    @Modifying
    @Query("DELETE FROM ReservationPassenger rp WHERE rp.reservation.id = :reservationId")
    void deleteAllByReservationId(@Param("reservationId") Long reservationId);

    // حذف یک مسافر خاص از یک رزرو (برای لغو انتخابی)
    @Modifying
    @Query("DELETE FROM ReservationPassenger rp WHERE rp.passenger.id = :passengerId AND rp.reservation.id = :reservationId")
    void deleteByPassengerIdAndReservationId(@Param("passengerId") Long passengerId, @Param("reservationId") Long reservationId);
}