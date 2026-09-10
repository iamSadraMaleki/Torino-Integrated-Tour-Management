package com.example.project.ceo_tour.station.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationImageDownload {
    private byte[] bytes;
    private String contentType;
    private String filename;
}