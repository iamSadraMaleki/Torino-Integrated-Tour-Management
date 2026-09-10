package com.example.project.ceo_tour.station.Repository;


import com.example.project.ceo_tour.station.model.StationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StationTypeRepository extends JpaRepository<StationType, Long> {

    List<StationType> findAllByCreatedByUsernameOrderByTypeNameAsc(String username);

    Optional<StationType> findByIdAndCreatedByUsername(Long id, String username);

    boolean existsByCreatedByUsernameAndTypeNameIgnoreCase(String username, String typeName);
}
