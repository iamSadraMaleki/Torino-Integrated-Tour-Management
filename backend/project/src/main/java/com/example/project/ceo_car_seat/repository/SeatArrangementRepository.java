package com.example.project.ceo_car_seat.repository;

import com.example.project.ceo_car_seat.model.SeatArrangement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatArrangementRepository extends JpaRepository<SeatArrangement, Long> {

    List<SeatArrangement> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<SeatArrangement> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT sa FROM SeatArrangement sa WHERE sa.user.username = :username")
    List<SeatArrangement> findByUsername(@Param("username") String username);

    @Query("SELECT sa FROM SeatArrangement sa WHERE sa.user.id = :userId AND sa.isDefault = true")
    Optional<SeatArrangement> findDefaultByUserId(@Param("userId") Long userId);
}

