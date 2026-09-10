package com.example.project.ceo_tour.station.Repository;


import com.example.project.ceo_tour.station.model.StationImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StationImageRepository extends JpaRepository<StationImage, Long> {

    Optional<StationImage> findByIdAndUploadedByUsername(Long id, String username);
}

