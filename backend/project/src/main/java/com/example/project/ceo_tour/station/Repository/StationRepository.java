package com.example.project.ceo_tour.station.Repository;


import com.example.project.ceo_tour.station.model.Station;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StationRepository extends JpaRepository<Station, Long> {

    List<Station> findAllByCreatedByUsernameOrderByCreatedAtDesc(String username);

    Optional<Station> findByIdAndCreatedByUsername(Long id, String username);
}

