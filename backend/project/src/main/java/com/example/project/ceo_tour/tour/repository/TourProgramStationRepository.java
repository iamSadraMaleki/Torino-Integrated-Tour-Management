package com.example.project.ceo_tour.tour.repository;

import com.example.project.ceo_tour.tour.model.TourProgramStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TourProgramStationRepository extends JpaRepository<TourProgramStation, Long> {

    List<TourProgramStation> findAllByTourIdOrderByOrderNoAsc(Long tourId);

    void deleteAllByTourId(Long tourId);

    Optional<TourProgramStation> findByIdAndTourCreatedByUsername(Long id, String username);
    List<TourProgramStation>
    findAllByTourIdAndIsActiveTrueOrderByOrderNoAsc(Long tourId);
    List<TourProgramStation>
    findAllByTour_IdOrderByOrderNoAsc(Long tourId);

    List<TourProgramStation>
    findAllByTour_IdAndIsActiveTrueOrderByOrderNoAsc(Long tourId);

}
