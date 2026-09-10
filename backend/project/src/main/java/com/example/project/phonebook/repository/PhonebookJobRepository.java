package com.example.project.phonebook.repository;

import com.example.project.phonebook.model.PhonebookJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PhonebookJobRepository extends JpaRepository<PhonebookJob, Long> {

    List<PhonebookJob> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<PhonebookJob> findByIdAndUserId(Long id, Long userId);

    List<PhonebookJob> findAllByOrderByCreatedAtDesc();
}
