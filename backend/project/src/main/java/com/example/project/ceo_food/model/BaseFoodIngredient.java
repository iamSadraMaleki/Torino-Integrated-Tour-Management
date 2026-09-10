package com.example.project.ceo_food.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "base_food_ingredient")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BaseFoodIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_food_id", nullable = false)
    private BaseFood baseFood;

    @Column(nullable = false, length = 100)
    private String ingredientName;

    @Column(length = 50)
    private String amount;
}
