package com.example.project.user_reservation.model;

import com.example.project.users.model.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "passengers",
        indexes = {
                @Index(name = "idx_passenger_national_code", columnList = "national_code"),
                @Index(name = "idx_passenger_user_id", columnList = "user_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Passenger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // کاربری که این مسافر رو اضافه کرده

    @NotBlank(message = "نام الزامی است")
    @Size(min = 2, max = 50, message = "نام باید بین 2 تا 50 کاراکتر باشد")
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @NotBlank(message = "نام خانوادگی الزامی است")
    @Size(min = 2, max = 50, message = "نام خانوادگی باید بین 2 تا 50 کاراکتر باشد")
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @NotBlank(message = "کد ملی الزامی است")
    @Pattern(regexp = "^\\d{10}$", message = "کد ملی باید 10 رقم باشد")
    @Column(name = "national_code", nullable = false, length = 10, unique = true)
    private String nationalCode;

    @NotBlank(message = "شماره تلفن الزامی است")
    @Pattern(regexp = "^09\\d{9}$", message = "شماره تلفن باید با 09 شروع شود و 11 رقم باشد")
    @Column(name = "mobile", nullable = false, length = 11)
    private String mobile;

    @NotNull(message = "تاریخ تولد الزامی است")
    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
