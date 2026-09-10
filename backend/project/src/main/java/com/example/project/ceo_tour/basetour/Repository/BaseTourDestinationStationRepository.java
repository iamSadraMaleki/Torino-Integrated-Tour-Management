package com.example.project.ceo_tour.basetour.Repository;


import com.example.project.ceo_tour.basetour.model.BaseTourDestinationStation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BaseTourDestinationStationRepository extends JpaRepository<BaseTourDestinationStation, Long> {

    List<BaseTourDestinationStation> findAllByBaseTourIdOrderByOrderNoAsc(Long baseTourId);

    void deleteAllByBaseTourId(Long baseTourId);
}

