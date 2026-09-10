package com.example.project.finance.repository;

import com.example.project.finance.model.SettlementRequest;
import com.example.project.finance.model.SettlementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface SettlementRequestRepository extends JpaRepository<SettlementRequest, Long> {

    List<SettlementRequest> findAllByOrderByRequestedAtDesc();

    List<SettlementRequest> findByAgencyUsernameOrderByRequestedAtDesc(String username);

    List<SettlementRequest> findByAgencyId(Long agencyId);

    long countByStatus(SettlementStatus status);

    @Query("SELECT COALESCE(SUM(s.netAmount), 0) FROM SettlementRequest s WHERE s.agency.username = :username AND s.status = :status")
    BigDecimal sumNetAmountByAgencyUsernameAndStatus(@Param("username") String username, @Param("status") SettlementStatus status);

    @Query("SELECT COALESCE(SUM(s.netAmount), 0) FROM SettlementRequest s WHERE s.status = :status")
    BigDecimal sumNetAmountByStatus(@Param("status") SettlementStatus status);
}
