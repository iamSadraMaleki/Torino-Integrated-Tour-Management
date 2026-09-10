package com.example.project.profile.verification.model;


import com.example.project.users.model.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ceo_verifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CeoVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @NotBlank
    @Column(name = "agency_name", nullable = false, length = 200)
    private String agencyName;

    @NotBlank
    @Column(name = "legal_name", nullable = false, length = 200)
    private String legalName;

    @NotBlank
    @Column(name = "ceo_name", nullable = false, length = 100)
    private String ceoName;

    @NotBlank
    @Column(name = "registration_number", nullable = false, length = 50)
    private String registrationNumber;

    @Column(name = "license_expiry_date")
    private LocalDate licenseExpiryDate;

    @NotBlank
    @Column(name = "tax_number", nullable = false, length = 50)
    private String taxNumber;

    @Column(name = "establishment_date")
    private LocalDate establishmentDate;

    @Email
    @NotBlank
    @Column(name = "company_email", nullable = false, length = 120)
    private String companyEmail;
    @NotBlank
    @Column(name = "company_phone", nullable = false, length = 20)
    private String companyPhone;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private VerificationStatus status;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
        if (status == null) {
            status = VerificationStatus.NOT_VERIFIED;
        }
    }
}
