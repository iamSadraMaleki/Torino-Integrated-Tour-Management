package com.example.project.profile.ceoinfo.model;


import com.example.project.users.model.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ceo_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CeoProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @NotBlank
    @Size(min = 3, max = 100)
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName; // نام کامل

    @NotBlank
    @Pattern(regexp = "^\\d{10}$", message = "کد ملی باید 10 رقم باشد")
    @Column(name = "national_code", nullable = false, length = 10, unique = true)
    private String nationalCode; // کد ملی

    @Column(name = "birth_date")
    private LocalDate birthDate; // تاریخ تولد

    @NotBlank
    @Pattern(regexp = "^09\\d{9}$", message = "شماره تماس باید با 09 شروع شود و 11 رقم باشد")
    @Column(name = "phone_number", nullable = false, length = 11)
    private String phoneNumber; // شماره تماس

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
