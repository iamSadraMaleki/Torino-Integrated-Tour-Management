package com.example.project.ceo_tour.basetour.dto;



import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BaseTourStationItemDto {

    private Long id;
    private Long stationId;
    private String stationName;

    private Integer orderNo;
    private Integer minutesToNext;
}
