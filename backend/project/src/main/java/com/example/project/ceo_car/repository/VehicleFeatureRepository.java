package com.example.project.ceo_car.repository;

import com.example.project.ceo_car.model.VehicleFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleFeatureRepository extends JpaRepository<VehicleFeature, Long> {

    List<VehicleFeature> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<VehicleFeature> findByUserIdAndIsActiveTrueOrderByNameAsc(Long userId);

    Optional<VehicleFeature> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndName(Long userId, String name);

    @Query("SELECT vf FROM VehicleFeature vf WHERE vf.user.username = :username ORDER BY vf.name ASC")
    List<VehicleFeature> findByUsername(@Param("username") String username);

    @Query("SELECT COUNT(vf) FROM VehicleFeature vf WHERE vf.user.id = :userId AND vf.isActive = true")
    long countActiveFeaturesByUserId(@Param("userId") Long userId);
}

