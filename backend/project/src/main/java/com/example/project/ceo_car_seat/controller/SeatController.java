package com.example.project.ceo_car_seat.controller;

import com.example.project.ceo_car_seat.dto.*;
import com.example.project.ceo_car_seat.model.SeatType;
import com.example.project.ceo_car_seat.services.SeatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ceo/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;
    private static final Logger logger = LoggerFactory.getLogger(SeatController.class);


    @PostMapping("/generate")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<SeatResponse> generateSeats(@Valid @RequestBody SeatGenerateRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} generating seats for vehicle {}", username, request.getVehicleId());

        List<SeatDto> seats = seatService.generateSeats(username, request);

        SeatResponse response = SeatResponse.builder()
                .success(true)
                .message("صندلی‌ها با موفقیت تولید شدند. تعداد: " + seats.size())
                .data(seats)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    @PutMapping("/{seatId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<SeatResponse> updateSeat(
            @PathVariable Long seatId,
            @Valid @RequestBody SeatUpdateRequest request) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} updating seat {}", username, seatId);

        SeatDto seat = seatService.updateSeat(username, seatId, request);

        SeatResponse response = SeatResponse.builder()
                .success(true)
                .message("صندلی با موفقیت ویرایش شد")
                .data(seat)
                .build();

        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/vehicle/{vehicleId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<SeatResponse> deleteSeatsByVehicle(@PathVariable Long vehicleId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} deleting all seats for vehicle {}", username, vehicleId);

        seatService.deleteSeatsByVehicle(username, vehicleId);

        SeatResponse response = SeatResponse.builder()
                .success(true)
                .message("تمام صندلی‌های ماشین با موفقیت حذف شدند")
                .data(null)
                .build();

        return ResponseEntity.ok(response);
    }


    @GetMapping("/{seatId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<SeatResponse> getSeat(@PathVariable Long seatId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching seat {}", username, seatId);

        SeatDto seat = seatService.getSeat(username, seatId);

        SeatResponse response = SeatResponse.builder()
                .success(true)
                .message("صندلی با موفقیت بازیابی شد")
                .data(seat)
                .build();

        return ResponseEntity.ok(response);
    }


    @GetMapping("/vehicle/{vehicleId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<SeatResponse> getSeatsByVehicle(@PathVariable Long vehicleId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching all seats for vehicle {}", username, vehicleId);

        List<SeatDto> seats = seatService.getSeatsByVehicle(username, vehicleId);

        SeatResponse response = SeatResponse.builder()
                .success(true)
                .message("لیست صندلی‌ها با موفقیت بازیابی شد")
                .data(seats)
                .build();

        return ResponseEntity.ok(response);
    }


    @GetMapping("/vehicle/{vehicleId}/active")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<SeatResponse> getActiveSeatsByVehicle(@PathVariable Long vehicleId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching active seats for vehicle {}", username, vehicleId);

        List<SeatDto> seats = seatService.getActiveSeatsByVehicle(username, vehicleId);

        SeatResponse response = SeatResponse.builder()
                .success(true)
                .message("لیست صندلی‌های فعال با موفقیت بازیابی شد")
                .data(seats)
                .build();

        return ResponseEntity.ok(response);
    }


    @GetMapping("/vehicle/{vehicleId}/row/{rowNumber}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<SeatResponse> getSeatsByRow(
            @PathVariable Long vehicleId,
            @PathVariable Integer rowNumber) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching seats for vehicle {} row {}", username, vehicleId, rowNumber);

        List<SeatDto> seats = seatService.getSeatsByRow(username, vehicleId, rowNumber);

        SeatResponse response = SeatResponse.builder()
                .success(true)
                .message("صندلی‌های ردیف " + rowNumber + " با موفقیت بازیابی شد")
                .data(seats)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/vehicle/{vehicleId}/statistics")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<SeatResponse> getStatistics(@PathVariable Long vehicleId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching statistics for vehicle {}", username, vehicleId);

        SeatStatisticsDto statistics = seatService.getStatistics(username, vehicleId);

        SeatResponse response = SeatResponse.builder()
                .success(true)
                .message("آمار صندلی‌ها با موفقیت بازیابی شد")
                .data(statistics)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/vehicle/{vehicleId}/filter/status/{isActive}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<SeatResponse> getSeatsByStatus(
            @PathVariable Long vehicleId,
            @PathVariable Boolean isActive) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching {} seats for vehicle {}",
                username, isActive ? "active" : "inactive", vehicleId);

        List<SeatDto> seats = seatService.getSeatsByStatus(username, vehicleId, isActive);

        String statusText = isActive ? "فعال" : "غیرفعال";
        SeatResponse response = SeatResponse.builder()
                .success(true)
                .message("لیست صندلی‌های " + statusText + " با موفقیت بازیابی شد")
                .data(seats)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/vehicle/{vehicleId}/filter/type/{seatType}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<SeatResponse> getSeatsByType(
            @PathVariable Long vehicleId,
            @PathVariable SeatType seatType) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching {} seats for vehicle {}", username, seatType, vehicleId);

        List<SeatDto> seats = seatService.getSeatsByType(username, vehicleId, seatType);

        SeatResponse response = SeatResponse.builder()
                .success(true)
                .message("لیست صندلی‌های " + seatType.name() + " با موفقیت بازیابی شد")
                .data(seats)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/vehicle/{vehicleId}/filter")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<SeatResponse> getSeatsByFilters(
            @PathVariable Long vehicleId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) SeatType seatType) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching seats with filters - isActive: {}, type: {} for vehicle {}",
                username, isActive, seatType, vehicleId);

        List<SeatDto> seats;

        if (isActive != null && seatType != null) {

            seats = seatService.getSeatsByStatusAndType(username, vehicleId, isActive, seatType);
        } else if (isActive != null) {

            seats = seatService.getSeatsByStatus(username, vehicleId, isActive);
        } else if (seatType != null) {

            seats = seatService.getSeatsByType(username, vehicleId, seatType);
        } else {

            seats = seatService.getSeatsByVehicle(username, vehicleId);
        }

        SeatResponse response = SeatResponse.builder()
                .success(true)
                .message("لیست صندلی‌ها با موفقیت بازیابی شد")
                .data(seats)
                .build();

        return ResponseEntity.ok(response);
    }

}

