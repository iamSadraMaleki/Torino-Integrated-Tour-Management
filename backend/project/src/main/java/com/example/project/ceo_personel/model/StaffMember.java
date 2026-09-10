package com.example.project.ceo_personel.model;


import com.example.project.users.model.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "staff_members",
        indexes = {
                @Index(name = "idx_staff_user_id", columnList = "user_id"),
                @Index(name = "idx_staff_position_id", columnList = "position_id"),
                @Index(name = "idx_staff_national_code", columnList = "national_code")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_national_code", columnNames = {"user_id", "national_code"})
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StaffMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "position_id", nullable = false)
    private Position position;

    @NotBlank
    @Size(min = 3, max = 100)
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @NotBlank
    @Pattern(regexp = "^\\d{10}$", message = "کد ملی باید 10 رقم باشد")
    @Column(name = "national_code", nullable = false, length = 10)
    private String nationalCode;

    @NotBlank
    @Size(min = 2, max = 50)
    @Column(name = "father_name", nullable = false, length = 50)
    private String fatherName;

    @NotNull
    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @NotBlank
    @Pattern(regexp = "^09\\d{9}$", message = "شماره تلفن باید با 09 شروع شود و 11 رقم باشد")
    @Column(name = "phone_number", nullable = false, length = 11)
    private String phoneNumber;

    @Column(name = "work_experience")
    private Integer workExperience;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (hireDate == null) {
            hireDate = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

