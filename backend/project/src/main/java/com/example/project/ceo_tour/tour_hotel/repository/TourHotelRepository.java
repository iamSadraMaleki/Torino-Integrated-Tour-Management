package com.example.project.ceo_tour.tour_hotel.repository;

import com.example.project.ceo_tour.tour_hotel.model.TourHotel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TourHotelRepository extends JpaRepository<TourHotel, Long> {

    List<TourHotel> findAllByTourId(Long tourId);

    Optional<TourHotel> findByIdAndTourId(Long id, Long tourId);

    boolean existsByTourIdAndBaseHotelId(Long tourId, Long baseHotelId);
}
