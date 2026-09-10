package com.example.project.ceo_tour.basetour.Repository;


import com.example.project.ceo_tour.basetour.model.BaseTourOriginStation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BaseTourOriginStationRepository extends JpaRepository<BaseTourOriginStation, Long> {

    List<BaseTourOriginStation> findAllByBaseTourIdOrderByOrderNoAsc(Long baseTourId);

    void deleteAllByBaseTourId(Long baseTourId);
}
