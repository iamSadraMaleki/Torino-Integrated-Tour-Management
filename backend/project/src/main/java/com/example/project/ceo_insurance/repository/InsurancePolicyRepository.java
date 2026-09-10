package com.example.project.ceo_insurance.repository;

import com.example.project.ceo_insurance.model.InsurancePolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InsurancePolicyRepository extends JpaRepository<InsurancePolicy, Long> {

    List<InsurancePolicy> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<InsurancePolicy> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndName(Long userId, String name);
}
