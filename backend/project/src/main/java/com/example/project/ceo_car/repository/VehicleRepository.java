package com.example.project.ceo_car.repository;


import com.example.project.ceo_car.model.Vehicle;
import com.example.project.ceo_car.model.VehicleStatus;
import com.example.project.ceo_car.model.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Vehicle> findByUserIdAndStatusOrderByNameAsc(Long userId, VehicleStatus status);

    List<Vehicle> findByUserIdAndTypeOrderByNameAsc(Long userId, VehicleType type);

    Optional<Vehicle> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndPlateNumber(Long userId, String plateNumber);

    @Query("SELECT v FROM Vehicle v WHERE v.user.username = :username ORDER BY v.createdAt DESC")
    List<Vehicle> findByUsername(@Param("username") String username);

    @Query("SELECT COUNT(v) FROM Vehicle v WHERE v.user.id = :userId AND v.status = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") VehicleStatus status);

    @Query("SELECT v.type, COUNT(v) FROM Vehicle v WHERE v.user.id = :userId GROUP BY v.type")
    List<Object[]> countByTypeForUser(@Param("userId") Long userId);

    @Query("SELECT v.manufacturer, COUNT(v) FROM Vehicle v WHERE v.user.id = :userId GROUP BY v.manufacturer")
    List<Object[]> countByManufacturerForUser(@Param("userId") Long userId);

    @Query("SELECT v.status, COUNT(v) FROM Vehicle v WHERE v.user.id = :userId GROUP BY v.status")
    List<Object[]> countByStatusForUser(@Param("userId") Long userId);
}

