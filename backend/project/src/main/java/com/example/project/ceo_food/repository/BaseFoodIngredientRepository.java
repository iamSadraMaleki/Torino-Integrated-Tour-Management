package com.example.project.ceo_food.repository;

import com.example.project.ceo_food.model.BaseFoodIngredient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BaseFoodIngredientRepository
        extends JpaRepository<BaseFoodIngredient, Long> {
}