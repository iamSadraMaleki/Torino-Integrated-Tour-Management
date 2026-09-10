package com.example.project.ceo_tour.tour_food.repository;


import com.example.project.ceo_tour.tour_food.model.TourDrink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TourDrinkRepository extends JpaRepository<TourDrink, Long> {

    List<TourDrink> findAllByTourId(Long tourId);

    List<TourDrink> findAllByTourIdOrderByServeDayAsc(Long tourId);

    long countByTourIdAndServeDay(Long tourId, String serveDay);

    @Query("SELECT COUNT(td) FROM TourDrink td WHERE td.tour.id = :tourId AND td.serveDay = :serveDay AND td.id <> :excludeId")
    long countByTourIdAndServeDayExcluding(
            @Param("tourId") Long tourId,
            @Param("serveDay") String serveDay,
            @Param("excludeId") Long excludeId);
}
