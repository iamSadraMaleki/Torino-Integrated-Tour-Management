package com.example.project.ceo_tour.tour.model;


import com.example.project.ceo_tour.station.model.Station;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tour_program_stations",
        indexes = {
                @Index(name = "idx_tour_prog_tour", columnList = "tour_id"),
                @Index(name = "idx_tour_prog_order", columnList = "tour_id, order_no")
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TourProgramStation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @Column(name = "order_no", nullable = false)
    private Integer orderNo;

    @Column(name = "minutes_to_next")
    private Integer minutesToNext;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}

