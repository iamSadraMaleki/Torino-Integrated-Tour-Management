package com.example.project.ceo_tour.station.controller;


import com.example.project.ceo_tour.station.Services.StationService;
import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.ceo_tour.station.dto.StationCreateRequest;
import com.example.project.ceo_tour.station.dto.StationDto;
import com.example.project.ceo_tour.station.dto.StationUpdateRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/ceo/stations")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;

    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<StationDto>> create(
            @RequestPart("data") String dataJson,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws Exception {

        StationCreateRequest data = new ObjectMapper()
                .readValue(dataJson, StationCreateRequest.class);

        var res = stationService.create(currentUsername(), data, image);
        return ResponseEntity.ok(ApiResponse.ok("Station created", res));
    }
    @PutMapping(value = "/{stationId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<StationDto>> update(
            @PathVariable Long stationId,
            @RequestPart("data") String dataJson,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws Exception {
        StationUpdateRequest data = new ObjectMapper()
                .readValue(dataJson, StationUpdateRequest.class);

        var res = stationService.update(currentUsername(), stationId, data, image);
        return ResponseEntity.ok(ApiResponse.ok("Station updated", res));
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<StationDto>>> myStations() {
        var res = stationService.getMyStations(currentUsername());
        return ResponseEntity.ok(ApiResponse.ok("Stations fetched", res));
    }

    @GetMapping("/{stationId}")
    public ResponseEntity<ApiResponse<StationDto>> getById(@PathVariable Long stationId) {
        var res = stationService.getById(currentUsername(), stationId);
        return ResponseEntity.ok(ApiResponse.ok("Station fetched", res));
    }

    @DeleteMapping("/{stationId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long stationId) {
        stationService.delete(currentUsername(), stationId);
        return ResponseEntity.ok(ApiResponse.ok("Station deleted", null));
    }
    @GetMapping("/images/{imageId}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long imageId) {
        var file = stationService.getImage(currentUsername(), imageId);

        return ResponseEntity.ok()
                .header("Content-Disposition", "inline; filename=\"" + file.getFilename() + "\"")
                .contentType(org.springframework.http.MediaType.parseMediaType(file.getContentType()))
                .body(file.getBytes());
    }

}

