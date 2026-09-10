package com.example.project.ceo_food.repository;


import com.example.project.ceo_food.model.BaseFood;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BaseFoodRepository extends JpaRepository<BaseFood, Long> {

    List<BaseFood> findAllByUserId(Long userId);

    Optional<BaseFood> findByIdAndUserId(Long id, Long userId);

    boolean existsByNameAndUserId(String name, Long userId);
}

