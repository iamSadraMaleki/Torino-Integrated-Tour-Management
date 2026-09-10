package com.example.project.profile.changepassword;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordLogRepository extends JpaRepository<PasswordLog, Long> {
}
