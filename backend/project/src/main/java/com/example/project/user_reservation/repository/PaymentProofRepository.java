package com.example.project.user_reservation.repository;
import com.example.project.user_reservation.model.PaymentProof;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentProofRepository extends JpaRepository<PaymentProof, Long> {
    Optional<PaymentProof> findByReservationId(Long reservationId);
    boolean existsByReservationId(Long reservationId);

}