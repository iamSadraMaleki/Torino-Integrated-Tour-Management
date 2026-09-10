package com.example.project.ceo_hotel.controller;

import com.example.project.ceo_hotel.dto.HotelDto;
import com.example.project.ceo_hotel.dto.HotelRequest;
import com.example.project.ceo_hotel.services.HotelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/ceo/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    @PostMapping
    public ResponseEntity<HotelDto> create(@Valid @RequestBody HotelRequest request) {
        log.info("POST /api/hotels - Creating hotel: {}", request.getName());
        HotelDto created = hotelService.createHotel(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HotelDto> update(
            @PathVariable Long id,
            @Valid @RequestBody HotelRequest request) {
        log.info("PUT /api/hotels/{} - Updating hotel", id);
        return ResponseEntity.ok(hotelService.updateHotel(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /api/hotels/{} - Deleting hotel", id);
        hotelService.deleteHotel(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<HotelDto>> getAll() {
        log.debug("GET /api/hotels - Fetching all hotels for current user");
        return ResponseEntity.ok(hotelService.getUserHotels());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HotelDto> getById(@PathVariable Long id) {
        log.debug("GET /api/hotels/{} - Fetching hotel by id", id);
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }
}
