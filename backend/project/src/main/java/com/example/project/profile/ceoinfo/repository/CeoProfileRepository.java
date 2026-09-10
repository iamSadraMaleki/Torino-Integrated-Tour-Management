package com.example.project.profile.ceoinfo.repository;


import com.example.project.profile.ceoinfo.model.CeoProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CeoProfileRepository extends JpaRepository<CeoProfile, Long> {

    Optional<CeoProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    boolean existsByNationalCode(String nationalCode);

    @Query("SELECT cp FROM CeoProfile cp WHERE cp.user.username = :username")
    Optional<CeoProfile> findByUsername(@Param("username") String username);
}

