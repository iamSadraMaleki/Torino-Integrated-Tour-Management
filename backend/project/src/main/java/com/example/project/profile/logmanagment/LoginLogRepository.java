package com.example.project.profile.logmanagment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LoginLogRepository extends JpaRepository<LoginLog, Long> {

    // آخرین ۵ لاگ کاربر (با id مشخص)
    @Query("SELECT l FROM LoginLog l WHERE l.user.id = :userId ORDER BY l.timestamp DESC")
    List<LoginLog> findTop5ByUserIdOrderByTimestampDesc(Long userId);
}
