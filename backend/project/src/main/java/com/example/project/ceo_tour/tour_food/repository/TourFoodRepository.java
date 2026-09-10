package com.example.project.ceo_tour.tour_food.repository;

import com.example.project.ceo_food.model.MealType;
import com.example.project.ceo_tour.tour_food.model.TourFood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TourFoodRepository extends JpaRepository<TourFood, Long> {

    List<TourFood> findAllByTourId(Long tourId);

    Optional<TourFood> findByIdAndTourId(Long id, Long tourId);

    /** تعداد غذاهای یک وعده خاص در یک روز — محدودیت «۲ غذا در هر وعده» */
    @Query("SELECT COUNT(tf) FROM TourFood tf WHERE tf.tour.id = :tourId AND tf.serveDay = :serveDay AND tf.baseFood.mealType = :mealType")
    long countByTourIdAndServeDayAndMealType(
            @Param("tourId") Long tourId,
            @Param("serveDay") String serveDay,
            @Param("mealType") MealType mealType);

    /** تعداد غذاهای یک وعده در یک روز — بدون رکورد فعلی (برای update) */
    @Query("SELECT COUNT(tf) FROM TourFood tf WHERE tf.tour.id = :tourId AND tf.serveDay = :serveDay AND tf.baseFood.mealType = :mealType AND tf.id <> :excludeId")
    long countByTourIdAndServeDayAndMealTypeExcluding(
            @Param("tourId") Long tourId,
            @Param("serveDay") String serveDay,
            @Param("mealType") MealType mealType,
            @Param("excludeId") Long excludeId);

    /** آیا همین غذا قبلاً در همین وعده و روز اضافه شده؟ (بدون رکورد فعلی برای update) */
    @Query("SELECT COUNT(tf) > 0 FROM TourFood tf WHERE tf.tour.id = :tourId AND tf.serveDay = :serveDay " +
            "AND tf.baseFood.mealType = :mealType AND tf.baseFood.id = :baseFoodId AND tf.id <> :excludeId")
    boolean existsDuplicateFoodInMeal(
            @Param("tourId") Long tourId,
            @Param("serveDay") String serveDay,
            @Param("mealType") MealType mealType,
            @Param("baseFoodId") Long baseFoodId,
            @Param("excludeId") Long excludeId);

    List<TourFood> findAllByTourIdOrderByServeDayAsc(Long tourId);
}
