package com.example.project.finance.repository;

import com.example.project.finance.model.CommissionConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommissionConfigRepository extends JpaRepository<CommissionConfig, Long> {

    Optional<CommissionConfig> findByAgencyId(Long agencyId);

    Optional<CommissionConfig> findByAgencyUsername(String username);
}
