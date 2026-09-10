package com.example.project.ceo_personel.repository;


import com.example.project.ceo_personel.model.StaffMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffMemberRepository extends JpaRepository<StaffMember, Long> {

    List<StaffMember> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<StaffMember> findByUserIdAndIsActiveTrueOrderByFullNameAsc(Long userId);

    List<StaffMember> findByPositionIdOrderByFullNameAsc(Long positionId);

    Optional<StaffMember> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndNationalCode(Long userId, String nationalCode);

    @Query("SELECT s FROM StaffMember s WHERE s.user.username = :username ORDER BY s.createdAt DESC")
    List<StaffMember> findByUsername(@Param("username") String username);

    @Query("SELECT COUNT(s) FROM StaffMember s WHERE s.user.id = :userId AND s.isActive = true")
    long countActiveStaffByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(s) FROM StaffMember s WHERE s.position.id = :positionId AND s.isActive = true")
    long countByPositionId(@Param("positionId") Long positionId);

    @Query("SELECT s.position.title, COUNT(s) FROM StaffMember s " +
            "WHERE s.user.id = :userId AND s.isActive = true " +
            "GROUP BY s.position.id, s.position.title")
    List<Object[]> countStaffByPositionForUser(@Param("userId") Long userId);
}

