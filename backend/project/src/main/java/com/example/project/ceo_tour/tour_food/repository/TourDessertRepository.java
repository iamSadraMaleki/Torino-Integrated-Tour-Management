package com.example.project.ceo_tour.tour_food.repository;

import com.example.project.ceo_tour.tour_food.model.TourDessert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TourDessertRepository extends JpaRepository<TourDessert, Long> {

    List<TourDessert> findAllByTourId(Long tourId);

    List<TourDessert> findAllByTourIdOrderByServeDayAsc(Long tourId);

    long countByTourIdAndServeDay(Long tourId, String serveDay);

    @Query("SELECT COUNT(td) FROM TourDessert td WHERE td.tour.id = :tourId AND td.serveDay = :serveDay AND td.id <> :excludeId")
    long countByTourIdAndServeDayExcluding(
            @Param("tourId") Long tourId,
            @Param("serveDay") String serveDay,
            @Param("excludeId") Long excludeId);
}
