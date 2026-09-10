package com.example.project.landing.repository;

import com.example.project.landing.model.LandingContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LandingContentRepository extends JpaRepository<LandingContent, Long> {

    Optional<LandingContent> findByContentKey(String contentKey);

    long countByContentKey(String contentKey);
}
