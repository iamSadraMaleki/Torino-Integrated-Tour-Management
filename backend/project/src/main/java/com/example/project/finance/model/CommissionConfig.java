package com.example.project.finance.model;

import com.example.project.users.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "commission_configs",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_commission_agency", columnNames = "agency_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommissionConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id", nullable = false, unique = true)
    private User agency;

    /** درصد کمیسیون پلتفرم (۰ تا ۱۰۰) */
    @Column(name = "commission_percent", nullable = false)
    private Integer commissionPercent;

    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = LocalDateTime.now();
    }
}
