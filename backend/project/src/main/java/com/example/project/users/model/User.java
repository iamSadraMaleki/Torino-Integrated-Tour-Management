package com.example.project.users.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import com.example.project.profile.verification.model.VerificationStatus;


import java.util.HashSet;
import java.util.Set;


@Entity
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "username"),
                @UniqueConstraint(columnNames = "email"),
                @UniqueConstraint(columnNames = "mobile"),
                @UniqueConstraint(columnNames = "customer_code")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @NotBlank
    @Size(min = 3, max = 50)
    @Column(nullable = false, length = 50)
    private String username;


    @NotBlank
    @Size(min = 60, max = 100)
    @Column(nullable = false, length = 100)
    private String password;


    @Email
    @NotBlank
    @Column(nullable = false, length = 120)
    private String email;


    @NotBlank
    @Column(nullable = false, length = 20)
    private String mobile;


    @Column(name = "customer_code", nullable = false, length = 7)
    private String customerCode;


    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    @Builder.Default
    private Set<Role> roles = new HashSet<>();


    @Column(nullable = false)
    private boolean enabled = true;


    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 32)
    private VerificationStatus verificationStatus = VerificationStatus.NOT_VERIFIED;

    /** شهر کاربر (برای اطلاعیه‌های هدفمند بر اساس شهر) */
    @Column(name = "city", length = 100)
    private String city;

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }
}
