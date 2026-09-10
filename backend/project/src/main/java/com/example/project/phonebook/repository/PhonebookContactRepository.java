package com.example.project.phonebook.repository;

import com.example.project.phonebook.model.PhonebookContact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PhonebookContactRepository extends JpaRepository<PhonebookContact, Long> {

    List<PhonebookContact> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<PhonebookContact> findByIdAndUserId(Long id, Long userId);

    long countByJobId(Long jobId);

    List<PhonebookContact> findAllByOrderByCreatedAtDesc();

    List<PhonebookContact> findByJobId(Long jobId);
}
