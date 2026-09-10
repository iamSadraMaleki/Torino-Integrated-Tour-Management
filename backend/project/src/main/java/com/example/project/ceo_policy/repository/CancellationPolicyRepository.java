package com.example.project.ceo_policy.repository;

import com.example.project.ceo_policy.model.CancellationPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CancellationPolicyRepository extends JpaRepository<CancellationPolicy, Long> {

    // دریافت همه سیاست‌های یک کاربر
    List<CancellationPolicy> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    // دریافت سیاست پیش‌فرض یک کاربر
    Optional<CancellationPolicy> findByUserIdAndIsDefaultTrue(Long userId);

    // دریافت سیاست توسط ID و کاربر
    Optional<CancellationPolicy> findByIdAndUserId(Long id, Long userId);

    // چک کردن وجود نام تکراری برای یک کاربر
    boolean existsByUserIdAndPolicyNameIgnoreCase(Long userId, String policyName);

    // ریست کردن is_default برای همه سیاست‌های یک کاربر (به غیر از یک ID خاص)
    @Modifying
    @Query("UPDATE CancellationPolicy cp SET cp.isDefault = false WHERE cp.user.id = :userId AND cp.id != :excludeId")
    void resetDefaultFlagForUser(@Param("userId") Long userId, @Param("excludeId") Long excludeId);

    // ریست کامل is_default برای یک کاربر
    @Modifying
    @Query("UPDATE CancellationPolicy cp SET cp.isDefault = false WHERE cp.user.id = :userId")
    void resetAllDefaultFlagsForUser(@Param("userId") Long userId);
}