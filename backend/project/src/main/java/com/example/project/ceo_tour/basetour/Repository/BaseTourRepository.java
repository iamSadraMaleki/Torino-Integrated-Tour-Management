package com.example.project.ceo_tour.basetour.Repository;


import com.example.project.ceo_tour.basetour.model.BaseTour;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BaseTourRepository extends JpaRepository<BaseTour, Long> {

    List<BaseTour> findAllByCreatedByUsernameOrderByCreatedAtDesc(String username);

    Optional<BaseTour> findByIdAndCreatedByUsername(Long id, String username);

    boolean existsByCreatedByUsernameAndTourCodeIgnoreCase(String username, String tourCode);

    Optional<BaseTour> findByIdAndCreatedById(Long id, Long createdById);

    boolean existsByIdAndCreatedById(Long id, Long createdById);
}

