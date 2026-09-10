package com.example.project.ceo_tour.station.controller;


import com.example.project.ceo_tour.station.Services.GeoService;
import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.ceo_tour.station.dto.CityDto;
import com.example.project.ceo_tour.station.dto.ProvinceDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ceo/geo")
@RequiredArgsConstructor
public class GeoController {

    private final GeoService geoService;

    @GetMapping("/provinces")
    public ResponseEntity<ApiResponse<List<ProvinceDto>>> getProvinces() {
        var data = geoService.getAllProvinces();
        return ResponseEntity.ok(
                ApiResponse.ok("Provinces fetched successfully", data)
        );
    }

    @GetMapping("/cities")
    public ResponseEntity<ApiResponse<List<CityDto>>> getCities(
            @RequestParam Long provinceId
    ) {
        var data = geoService.getCitiesByProvince(provinceId);
        return ResponseEntity.ok(
                ApiResponse.ok("Cities fetched successfully", data)
        );
    }
}
