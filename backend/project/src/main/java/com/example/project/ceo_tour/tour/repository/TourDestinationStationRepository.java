package com.example.project.ceo_tour.tour.repository;


import com.example.project.ceo_tour.tour.model.TourDestinationStation;
import com.example.project.ceo_tour.tour.model.TourProgramStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TourDestinationStationRepository extends JpaRepository<TourDestinationStation, Long> {

    List<TourDestinationStation> findAllByTourIdOrderByOrderNoAsc(Long tourId);

    void deleteAllByTourId(Long tourId);

    Optional<TourDestinationStation> findByIdAndTourCreatedByUsername(Long id, String username);
    List<TourDestinationStation>
    findAllByTourIdAndIsActiveTrueOrderByOrderNoAsc(Long tourId);

    List<TourDestinationStation>
    findAllByTour_IdAndIsActiveTrueOrderByOrderNoAsc(Long tourId);


}
