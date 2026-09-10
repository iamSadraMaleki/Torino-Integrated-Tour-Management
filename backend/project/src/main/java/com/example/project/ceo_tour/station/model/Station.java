package com.example.project.ceo_tour.station.model;


import com.example.project.users.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "stations",
        indexes = {
                @Index(name = "idx_station_province", columnList = "province_id"),
                @Index(name = "idx_station_city", columnList = "city_id"),
                @Index(name = "idx_station_creator", columnList = "created_by_user_id")
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "province_id", nullable = false)
    private Province province;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @Column(name = "station_name", nullable = false, length = 150)
    private String stationName;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "station_type_id", nullable = false)
    private StationType stationType;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_image_id")
    private StationImage stationImage;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;


    @Column(name = "location", length = 500)
    private String location;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
