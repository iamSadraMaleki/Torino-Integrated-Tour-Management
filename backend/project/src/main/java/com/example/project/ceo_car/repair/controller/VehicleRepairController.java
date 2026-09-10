package com.example.project.ceo_car.repair.controller;

import com.example.project.ceo_car.dto.VehicleResponse;
import com.example.project.ceo_car.repair.dto.VehicleRepairRequest;
import com.example.project.ceo_car.repair.dto.VehicleRepairResponse;
import com.example.project.ceo_car.repair.dto.VehicleRepairStatsResponse;
import com.example.project.ceo_car.repair.services.VehicleRepairService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * دفتر تعمیرات خودرو — ثبت سرویس/تعمیر، لیست و آمار (فقط مدیر آژانس)
 */
@RestController
@RequestMapping("/api/ceo/vehicle-repairs")
@RequiredArgsConstructor
public class VehicleRepairController {

    private final VehicleRepairService repairService;

    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    /** ثبت سرویس/تعمیر جدید */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<VehicleResponse> recordRepair(@Valid @RequestBody VehicleRepairRequest request) {
        VehicleRepairResponse data = repairService.recordRepair(currentUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(VehicleResponse.builder()
                        .success(true)
                        .message("سرویس با موفقیت در دفتر تعمیرات ثبت شد")
                        .data(data)
                        .build());
    }

    /** همه سرویس‌های ثبت‌شده */
    @GetMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<VehicleResponse> getRepairs() {
        List<VehicleRepairResponse> data = repairService.getRepairs(currentUsername());
        return ResponseEntity.ok(VehicleResponse.builder()
                .success(true)
                .message("لیست سرویس‌ها")
                .data(data)
                .build());
    }

    /** سرویس‌های یک خودرو خاص */
    @GetMapping("/vehicle/{vehicleId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<VehicleResponse> getRepairsByVehicle(@PathVariable Long vehicleId) {
        List<VehicleRepairResponse> data = repairService.getRepairsByVehicle(currentUsername(), vehicleId);
        return ResponseEntity.ok(VehicleResponse.builder()
                .success(true)
                .message("سرویس‌های خودرو")
                .data(data)
                .build());
    }

    /** آمار دفتر تعمیرات (کل + به تفکیک خودرو/نوع/ماه) */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<VehicleResponse> getStatistics() {
        VehicleRepairStatsResponse data = repairService.getStatistics(currentUsername());
        return ResponseEntity.ok(VehicleResponse.builder()
                .success(true)
                .message("آمار دفتر تعمیرات")
                .data(data)
                .build());
    }

    /** حذف یک سرویس */
    @DeleteMapping("/{repairId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<VehicleResponse> deleteRepair(@PathVariable Long repairId) {
        repairService.deleteRepair(currentUsername(), repairId);
        return ResponseEntity.ok(VehicleResponse.builder()
                .success(true)
                .message("سرویس حذف شد")
                .data(null)
                .build());
    }
}
