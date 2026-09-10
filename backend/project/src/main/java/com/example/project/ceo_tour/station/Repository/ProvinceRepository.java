package com.example.project.ceo_tour.station.Repository;

import com.example.project.ceo_tour.station.model.Province;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProvinceRepository extends JpaRepository<Province, Long> {

    Optional<Province> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
