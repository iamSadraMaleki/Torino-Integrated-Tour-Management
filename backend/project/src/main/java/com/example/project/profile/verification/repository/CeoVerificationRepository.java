package com.example.project.profile.verification.repository;


import com.example.project.profile.verification.model.CeoVerification;
import com.example.project.profile.verification.model.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CeoVerificationRepository extends JpaRepository<CeoVerification, Long> {

    Optional<CeoVerification> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<CeoVerification> findByStatus(VerificationStatus status);

    @Query("SELECT cv FROM CeoVerification cv WHERE cv.status = :status ORDER BY cv.submittedAt ASC")
    List<CeoVerification> findPendingVerifications(@Param("status") VerificationStatus status);

    @Query("SELECT cv FROM CeoVerification cv WHERE cv.user.username = :username")
    Optional<CeoVerification> findByUsername(@Param("username") String username);

    @Query("SELECT cv FROM CeoVerification cv JOIN FETCH cv.user ORDER BY cv.submittedAt DESC")
    List<CeoVerification> findAllWithUser();

    long countByStatus(VerificationStatus status);
}

