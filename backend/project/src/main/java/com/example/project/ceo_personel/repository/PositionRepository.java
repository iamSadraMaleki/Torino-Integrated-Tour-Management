package com.example.project.ceo_personel.repository;


import com.example.project.ceo_personel.model.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PositionRepository extends JpaRepository<Position, Long> {

    List<Position> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Position> findByUserIdAndIsActiveTrueOrderByTitleAsc(Long userId);

    Optional<Position> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT p FROM Position p WHERE p.user.username = :username ORDER BY p.createdAt DESC")
    List<Position> findByUsername(@Param("username") String username);

    @Query("SELECT COUNT(p) FROM Position p WHERE p.user.id = :userId AND p.isActive = true")
    long countActivePositionsByUserId(@Param("userId") Long userId);
}
