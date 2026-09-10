package com.example.project.user_reservation.model;

import com.example.project.ceo_car_seat.model.Seat;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reservation_seats",
        indexes = {
                @Index(name = "idx_res_seat_reservation", columnList = "reservation_id"),
                @Index(name = "idx_res_seat_seat", columnList = "seat_id"),
                @Index(name = "idx_res_seat_tour", columnList = "tour_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    @Column(name = "tour_id", nullable = false)
    private Long tourId;
}
