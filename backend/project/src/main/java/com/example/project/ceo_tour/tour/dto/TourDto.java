package com.example.project.ceo_tour.tour.dto;

import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.ceo_tour.tour.model.TourStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TourDto {

    private Long id;
    private Long baseTourId;
    private String baseTourName;
    private String baseTourCode;
    /** نام کاربری مدیر آژانس برگزارکننده تور — برای نمایش در لیست همه تورها (ادمین) */
    private String createdByUsername;
    private LocalDate departureDate;
    private LocalDate returnDate;
    private BigDecimal price;
    private Integer capacity;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private TourStatus status;
    private String statusPersian;

    public static TourDto fromEntity(Tour t) {
        return TourDto.builder()
                .id(t.getId())
                .baseTourId(t.getBaseTour().getId())
                .baseTourName(t.getBaseTour().getTourName())
                .baseTourCode(t.getBaseTour().getTourCode())
                .createdByUsername(t.getCreatedBy() != null ? t.getCreatedBy().getUsername() : null)
                .departureDate(t.getDepartureDate())
                .returnDate(t.getReturnDate())
                .price(t.getPrice())
                .capacity(t.getCapacity())
                .description(t.getDescription())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .status(t.getStatus())
                .statusPersian(t.getStatus() != null ? t.getStatus().getPersianName() : null)
                .build();
    }
}
