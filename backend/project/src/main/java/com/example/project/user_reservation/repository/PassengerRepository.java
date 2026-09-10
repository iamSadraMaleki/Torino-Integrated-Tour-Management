package com.example.project.user_reservation.repository;

import com.example.project.user_reservation.model.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PassengerRepository extends JpaRepository<Passenger, Long> {
    List<Passenger> findAllByUserId(Long userId);
    Optional<Passenger> findByNationalCode(String nationalCode);
    boolean existsByNationalCode(String nationalCode);

}