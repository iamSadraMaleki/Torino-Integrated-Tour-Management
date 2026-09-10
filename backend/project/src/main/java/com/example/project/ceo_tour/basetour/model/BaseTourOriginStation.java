package com.example.project.ceo_tour.basetour.model;

import com.example.project.ceo_tour.station.model.Station;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "base_tour_origin_stations",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_origin_tour_order", columnNames = {"base_tour_id", "order_no"})
        },
        indexes = {
                @Index(name = "idx_origin_tour", columnList = "base_tour_id"),
                @Index(name = "idx_origin_station", columnList = "station_id")
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BaseTourOriginStation {

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
