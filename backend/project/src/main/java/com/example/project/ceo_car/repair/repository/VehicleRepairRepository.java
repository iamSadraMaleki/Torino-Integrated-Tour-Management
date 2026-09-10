package com.example.project.ceo_car.repair.repository;

import com.example.project.ceo_car.repair.model.VehicleRepairRecord;
import com.example.project.ceo_car.repair.model.VehicleRepairType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VehicleRepairRepository extends JpaRepository<VehicleRepairRecord, Long> {

    /** همه تعمیرات خودروهای یک مدیر آژانس — جدیدترین اول */
    @Query("SELECT r FROM VehicleRepairRecord r WHERE r.vehicle.user.id = :userId ORDER BY r.repairDate DESC, r.id DESC")
    List<VehicleRepairRecord> findAllByUserId(@Param("userId") Long userId);

    /** تعمیرات یک خودرو خاص (برای مدیر آژانس صاحب خودرو) */
    @Query("SELECT r FROM VehicleRepairRecord r WHERE r.vehicle.id = :vehicleId AND r.vehicle.user.id = :userId ORDER BY r.repairDate DESC, r.id DESC")
    List<VehicleRepairRecord> findByVehicleIdAndUserId(@Param("vehicleId") Long vehicleId, @Param("userId") Long userId);

    /** مجموع هزینه تعمیرات یک مدیر آژانس */
    @Query("SELECT COALESCE(SUM(r.cost), 0) FROM VehicleRepairRecord r WHERE r.vehicle.user.id = :userId")
    java.math.BigDecimal sumByUserId(@Param("userId") Long userId);

    /** مجموع هزینه تعمیرات یک خودرو خاص */
    @Query("SELECT COALESCE(SUM(r.cost), 0) FROM VehicleRepairRecord r WHERE r.vehicle.id = :vehicleId AND r.vehicle.user.id = :userId")
    java.math.BigDecimal sumByVehicleIdAndUserId(@Param("vehicleId") Long vehicleId, @Param("userId") Long userId);

    /** مجموع هزینه به تفکیک نوع سرویس */
    @Query("SELECT r.repairType, COALESCE(SUM(r.cost), 0), COUNT(r) FROM VehicleRepairRecord r " +
            "WHERE r.vehicle.user.id = :userId GROUP BY r.repairType")
    List<Object[]> sumByType(@Param("userId") Long userId);

    /** مجموع هزینه به تفکیک ماه */
    @Query("SELECT FUNCTION('to_char', r.repairDate, 'YYYY-MM'), COALESCE(SUM(r.cost), 0), COUNT(r) " +
            "FROM VehicleRepairRecord r WHERE r.vehicle.user.id = :userId " +
            "GROUP BY FUNCTION('to_char', r.repairDate, 'YYYY-MM') " +
            "ORDER BY FUNCTION('to_char', r.repairDate, 'YYYY-MM') DESC")
    List<Object[]> sumByMonth(@Param("userId") Long userId);
}
