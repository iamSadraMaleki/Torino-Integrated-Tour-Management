package com.example.project.ceo_hotel.repository;

import com.example.project.ceo_hotel.model.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HotelRepository extends JpaRepository<Hotel, Long> {

    List<Hotel> findAllByUserId(Long userId);

    Optional<Hotel> findByIdAndUserId(Long id, Long userId);

    boolean existsByNameAndUserId(String name, Long userId);

    @Query("SELECT COUNT(h) FROM Hotel h WHERE h.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
}
