package com.example.project.ceo_tour.basetour.model;


import com.example.project.ceo_tour.station.model.Station;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "base_tour_program_stations",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_program_tour_order", columnNames = {"base_tour_id", "order_no"})
        },
        indexes = {
                @Index(name = "idx_program_tour", columnList = "base_tour_id"),
                @Index(name = "idx_program_station", columnList = "station_id")
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BaseTourProgramStation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "base_tour_id", nullable = false)
    private BaseTour baseTour;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @Column(name = "order_no", nullable = false)
    private Integer orderNo;

    @Column(name = "minutes_to_next")
    private Integer minutesToNext;
}

