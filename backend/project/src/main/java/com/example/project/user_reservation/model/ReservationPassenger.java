package com.example.project.user_reservation.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reservation_passengers",
        indexes = {
                @Index(name = "idx_res_pass_reservation", columnList = "reservation_id"),
                @Index(name = "idx_res_pass_passenger", columnList = "passenger_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationPassenger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "passenger_id", nullable = false)
    private Passenger passenger;
}
