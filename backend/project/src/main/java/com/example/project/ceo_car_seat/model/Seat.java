package com.example.project.ceo_car_seat.model;


import com.example.project.ceo_car.model.Vehicle;
import com.example.project.users.model.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "seats",
        indexes = {
                @Index(name = "idx_seat_vehicle_id", columnList = "vehicle_id"),
                @Index(name = "idx_seat_user_id", columnList = "user_id"),
                @Index(name = "idx_seat_number", columnList = "seat_number")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_vehicle_seat_number",
                        columnNames = {"vehicle_id", "seat_number"})
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @NotNull
    @Min(1)
    @Column(name = "seat_number", nullable = false)
    private Integer seatNumber; // شماره صندلی

    @NotNull
    @Min(1)
    @Column(name = "row_number", nullable = false)
    private Integer rowNumber; // شماره ردیف

    @NotBlank
    @Column(name = "position", nullable = false, length = 10)
    private String position; // جایگاه: A, B, C, D و...

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "seat_type", nullable = false, length = 20)
    @Builder.Default
    private SeatType seatType = SeatType.REGULAR;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
