package com.example.project.ceo_tour.station.Repository;


import com.example.project.ceo_tour.station.model.City;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CityRepository extends JpaRepository<City, Long> {

    List<City> findAllByProvinceIdOrderByNameAsc(Long provinceId);

    Optional<City> findByProvinceIdAndNameIgnoreCase(Long provinceId, String name);

    boolean existsByProvinceIdAndNameIgnoreCase(Long provinceId, String name);
}
