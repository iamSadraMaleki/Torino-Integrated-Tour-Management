package com.example.project.ceo_car_seat.repository;


import com.example.project.ceo_car_seat.model.Seat;
import com.example.project.ceo_car_seat.model.SeatType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    // دریافت صندلی‌های یک ماشین
    List<Seat> findByVehicleIdOrderBySeatNumberAsc(Long vehicleId);

    // دریافت صندلی‌های فعال یک ماشین
    List<Seat> findByVehicleIdAndIsActiveTrueOrderBySeatNumberAsc(Long vehicleId);

    // دریافت صندلی با شماره خاص
    Optional<Seat> findByVehicleIdAndSeatNumber(Long vehicleId, Integer seatNumber);

    // دریافت صندلی‌های یک ردیف
    List<Seat> findByVehicleIdAndRowNumberOrderBySeatNumberAsc(Long vehicleId, Integer rowNumber);

    // دریافت صندلی خاص توسط CEO
    @Query("SELECT s FROM Seat s WHERE s.id = :seatId AND s.user.id = :userId")
    Optional<Seat> findByIdAndUserId(@Param("seatId") Long seatId, @Param("userId") Long userId);

    // شمارش صندلی‌های فعال
    @Query("SELECT COUNT(s) FROM Seat s WHERE s.vehicle.id = :vehicleId AND s.isActive = true")
    long countActiveByVehicleId(@Param("vehicleId") Long vehicleId);

    // شمارش بر اساس نوع
    @Query("SELECT COUNT(s) FROM Seat s WHERE s.vehicle.id = :vehicleId AND s.seatType = :type")
    long countByVehicleIdAndType(@Param("vehicleId") Long vehicleId, @Param("type") SeatType type);

    // حذف تمام صندلی‌های یک ماشین
    @Modifying
    @Query("DELETE FROM Seat s WHERE s.vehicle.id = :vehicleId AND s.user.id = :userId")
    void deleteByVehicleIdAndUserId(@Param("vehicleId") Long vehicleId, @Param("userId") Long userId);

    // بررسی وجود صندلی برای ماشین
    boolean existsByVehicleId(Long vehicleId);

    // 🆕 فیلتر بر اساس وضعیت (فعال/غیرفعال)
    List<Seat> findByVehicleIdAndIsActiveOrderBySeatNumberAsc(Long vehicleId, Boolean isActive);

    // 🆕 فیلتر بر اساس نوع صندلی
    List<Seat> findByVehicleIdAndSeatTypeOrderBySeatNumberAsc(Long vehicleId, SeatType seatType);

    // 🆕 فیلتر ترکیبی: وضعیت + نوع
    List<Seat> findByVehicleIdAndIsActiveAndSeatTypeOrderBySeatNumberAsc(
            Long vehicleId, Boolean isActive, SeatType seatType);

    // 🆕 فیلتر بر اساس نوع برای کاربر خاص
    @Query("SELECT s FROM Seat s WHERE s.vehicle.id = :vehicleId AND s.seatType = :seatType AND s.user.id = :userId")
    List<Seat> findByVehicleIdAndSeatTypeAndUserId(
            @Param("vehicleId") Long vehicleId,
            @Param("seatType") SeatType seatType,
            @Param("userId") Long userId);

    // 🆕 فیلتر بر اساس وضعیت برای کاربر خاص
    @Query("SELECT s FROM Seat s WHERE s.vehicle.id = :vehicleId AND s.isActive = :isActive AND s.user.id = :userId")
    List<Seat> findByVehicleIdAndIsActiveAndUserId(
            @Param("vehicleId") Long vehicleId,
            @Param("isActive") Boolean isActive,
            @Param("userId") Long userId);

}
