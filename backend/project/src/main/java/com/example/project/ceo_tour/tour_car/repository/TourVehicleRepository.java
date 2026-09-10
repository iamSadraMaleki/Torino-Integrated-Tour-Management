package com.example.project.ceo_tour.tour_car.repository;

import com.example.project.ceo_tour.tour_car.model.TourVehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourVehicleRepository extends JpaRepository<TourVehicle, Long> {

    boolean existsByTourIdAndVehicleId(Long tourId, Long vehicleId);

    List<TourVehicle> findAllByTourId(Long tourId);

    void deleteByTourIdAndVehicleId(Long tourId, Long vehicleId);

    /** همه تورهایی که یک خودرو در آن‌ها تخصیص داده شده (برای مدیر آژانس صاحب خودرو) — جدیدترین اول */
    @Query("SELECT tv FROM TourVehicle tv JOIN tv.tour t JOIN t.createdBy u " +
            "WHERE tv.vehicle.id = :vehicleId AND u.username = :username " +
            "ORDER BY tv.createdAt DESC")
    List<TourVehicle> findAllByVehicleIdAndUsername(@Param("vehicleId") Long vehicleId,
                                                    @Param("username") String username);
}