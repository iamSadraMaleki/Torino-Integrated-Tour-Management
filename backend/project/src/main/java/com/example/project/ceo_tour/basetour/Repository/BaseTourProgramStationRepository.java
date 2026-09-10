package com.example.project.ceo_tour.basetour.Repository;

import com.example.project.ceo_tour.basetour.model.BaseTourProgramStation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BaseTourProgramStationRepository extends JpaRepository<BaseTourProgramStation, Long> {

    List<BaseTourProgramStation> findAllByBaseTourIdOrderByOrderNoAsc(Long baseTourId);

    void deleteAllByBaseTourId(Long baseTourId);
}

