package com.example.project.ceo_tour.basetour.model;


import com.example.project.ceo_tour.station.model.City;
import com.example.project.users.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "base_tours",
        indexes = {
                @Index(name = "idx_base_tour_creator", columnList = "created_by_user_id"),
                @Index(name = "idx_base_tour_origin_city", columnList = "origin_city_id"),
                @Index(name = "idx_base_tour_destination_city", columnList = "destination_city_id")
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BaseTour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tour_name", nullable = false, length = 150)
    private String tourName;

    @Column(name = "tour_code", nullable = false, length = 50)
    private String tourCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "origin_city_id", nullable = false)
    private City originCity;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destination_city_id", nullable = false)
    private City destinationCity;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
