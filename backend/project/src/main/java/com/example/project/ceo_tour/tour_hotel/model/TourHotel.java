package com.example.project.ceo_tour.tour_hotel.model;

import com.example.project.ceo_hotel.model.Hotel;
import com.example.project.ceo_tour.tour.model.Tour;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tour_hotel")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourHotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_hotel_id", nullable = false)
    private Hotel baseHotel;

    @Column(nullable = false)
    private Integer nightCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

