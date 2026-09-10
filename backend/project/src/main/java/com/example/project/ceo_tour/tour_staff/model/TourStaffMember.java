package com.example.project.ceo_tour.tour_staff.model;
import com.example.project.ceo_personel.model.StaffMember;
import com.example.project.ceo_tour.tour.model.Tour;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tour_staff_member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourStaffMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // تور
    @ManyToOne
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    // پرسنل از جدول StaffMember
    @ManyToOne
    @JoinColumn(name = "staff_member_id", nullable = false)
    private StaffMember staffMember;

    @Column(nullable = false)
    private BigDecimal paymentAmount;

    private LocalDateTime createdAt;
}