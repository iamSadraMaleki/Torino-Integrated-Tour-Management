package com.example.project.ceo_tour.tour.repository;

import com.example.project.ceo_tour.tour.model.TourOriginStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TourOriginStationRepository extends JpaRepository<TourOriginStation, Long> {

    List<TourOriginStation> findAllByTourIdOrderByOrderNoAsc(Long tourId);

    void deleteAllByTourId(Long tourId);

    Optional<TourOriginStation> findByIdAndTourCreatedByUsername(Long id, String username);
    List<TourOriginStation>
    findAllByTourIdAndIsActiveTrueOrderByOrderNoAsc(Long tourId);
    List<TourOriginStation>
    findAllByTour_IdOrderByOrderNoAsc(Long tourId);

    // فقط ایستگاه‌های فعال
    List<TourOriginStation>
    findAllByTour_IdAndIsActiveTrueOrderByOrderNoAsc(Long tourId);

    // حذف همه ایستگاه‌های یک تور
    void deleteAllByTour_Id(Long tourId);

    // چک مالکیت
    Optional<TourOriginStation>
    findByIdAndTour_CreatedBy_Username(Long id, String username);

}
