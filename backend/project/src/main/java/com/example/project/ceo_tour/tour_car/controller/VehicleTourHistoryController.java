package com.example.project.ceo_tour.tour_car.controller;

import com.example.project.ceo_car.dto.VehicleResponse;
import com.example.project.ceo_tour.tour_car.dto.VehicleTourHistoryResponseDTO;
import com.example.project.ceo_tour.tour_car.services.TourVehicleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * تاریخچه سفرهای یک خودرو — تورهایی که خودرو در آن‌ها تخصیص داده شده (فقط مدیر آژانس)
 */
@RestController
@RequestMapping("/api/ceo/vehicles")
@RequiredArgsConstructor
@Slf4j
public class VehicleTourHistoryController {

    private final TourVehicleService tourVehicleService;

    @GetMapping("/{vehicleId}/tours")
    public ResponseEntity<VehicleResponse> getVehicleTours(
            @PathVariable Long vehicleId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("GET /api/ceo/vehicles/{}/tours by {}", vehicleId, username);

        List<VehicleTourHistoryResponseDTO> data = tourVehicleService.getToursByVehicle(username, vehicleId);

        return ResponseEntity.ok(VehicleResponse.builder()
                .success(true)
                .message("تاریخچه سفرهای خودرو")
                .data(data)
                .build());
    }
}
