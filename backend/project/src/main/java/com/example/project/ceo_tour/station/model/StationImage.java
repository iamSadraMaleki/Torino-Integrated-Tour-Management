package com.example.project.ceo_tour.station.model;

import com.example.project.users.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "station_images",
        indexes = {
                @Index(name = "idx_station_image_uploader", columnList = "uploaded_by_user_id")
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class StationImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // آپلودکننده
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "uploaded_by_user_id", nullable = false)
    private User uploadedBy;

    // گزینه 1: ذخیره فایل داخل DB
    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "image_bytes")
    private byte[] imageBytes;

    // گزینه 2: ذخیره مسیر/آدرس فایل (اگر خواستی جایگزین bytea کنی)
    // @Column(name = "image_url", length = 500)
    // private String imageUrl;

    @Column(name = "description", length = 300)
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
