package com.example.project.ceo_tour.tour_insurance.repository;

import com.example.project.ceo_tour.tour_insurance.model.TourInsurance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TourInsuranceRepository extends JpaRepository<TourInsurance, Long> {

    boolean existsByTourIdAndInsurancePolicyId(Long tourId, Long insurancePolicyId);

    List<TourInsurance> findAllByTourId(Long tourId);

    Optional<TourInsurance> findByIdAndTourId(Long id, Long tourId);
}
