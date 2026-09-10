package com.example.project.ceo_car.repair.services;

import com.example.project.ceo_car.model.Vehicle;
import com.example.project.ceo_car.repair.dto.VehicleRepairRequest;
import com.example.project.ceo_car.repair.dto.VehicleRepairResponse;
import com.example.project.ceo_car.repair.dto.VehicleRepairStatsResponse;
import com.example.project.ceo_car.repair.model.VehicleRepairRecord;
import com.example.project.ceo_car.repair.model.VehicleRepairType;
import com.example.project.ceo_car.repair.repository.VehicleRepairRepository;
import com.example.project.ceo_car.repository.VehicleRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VehicleRepairServiceImpl implements VehicleRepairService {

    private final VehicleRepairRepository repairRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public VehicleRepairResponse recordRepair(String ceoUsername, VehicleRepairRequest request) {
        User user = findUser(ceoUsername);

        Vehicle vehicle = vehicleRepository.findByIdAndUserId(request.getVehicleId(), user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "خودرو مورد نظر پیدا نشد یا متعلق به شما نیست"));

        VehicleRepairType type;
        try {
            type = VehicleRepairType.valueOf(request.getRepairType() != null
                    ? request.getRepairType().trim().toUpperCase() : "");
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "نوع سرویس نامعتبر است — باید ROUTINE_SERVICE، REPAIR، ACCIDENT یا OTHER باشد");
        }

        VehicleRepairRecord record = VehicleRepairRecord.builder()
                .vehicle(vehicle)
                .repairDate(request.getRepairDate())
                .cost(request.getCost())
                .repairType(type)
                .title(request.getTitle().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .workshopName(request.getWorkshopName() != null ? request.getWorkshopName().trim() : null)
                .createdBy(ceoUsername)
                .build();

        record = repairRepository.save(record);
        log.info("Repair record {} ({} - {}) recorded by {} for vehicle {}",
                record.getId(), type, record.getCost(), ceoUsername, vehicle.getName());

        return toResponse(record);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleRepairResponse> getRepairs(String ceoUsername) {
        User user = findUser(ceoUsername);
        return repairRepository.findAllByUserId(user.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleRepairResponse> getRepairsByVehicle(String ceoUsername, Long vehicleId) {
        User user = findUser(ceoUsername);
        vehicleRepository.findByIdAndUserId(vehicleId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "خودرو مورد نظر پیدا نشد یا متعلق به شما نیست"));
        return repairRepository.findByVehicleIdAndUserId(vehicleId, user.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleRepairStatsResponse getStatistics(String ceoUsername) {
        User user = findUser(ceoUsername);
        Long userId = user.getId();

        BigDecimal totalCost = repairRepository.sumByUserId(userId);
        List<VehicleRepairRecord> all = repairRepository.findAllByUserId(userId);
        long repairCount = all.size();

        // به تفکیک خودرو
        Map<Long, BigDecimal> costByVehicle = new LinkedHashMap<>();
        Map<Long, Long> countByVehicle = new LinkedHashMap<>();
        Map<Long, String> nameByVehicle = new LinkedHashMap<>();
        Map<Long, String> plateByVehicle = new LinkedHashMap<>();
        for (VehicleRepairRecord r : all) {
            Long vid = r.getVehicle().getId();
            costByVehicle.merge(vid, r.getCost(), BigDecimal::add);
            countByVehicle.merge(vid, 1L, Long::sum);
            nameByVehicle.put(vid, r.getVehicle().getName());
            plateByVehicle.put(vid, r.getVehicle().getPlateNumber());
        }

        List<VehicleRepairStatsResponse.PerVehicle> perVehicle = nameByVehicle.entrySet().stream()
                .map(e -> VehicleRepairStatsResponse.PerVehicle.builder()
                        .vehicleId(e.getKey())
                        .vehicleName(e.getValue())
                        .plateNumber(plateByVehicle.get(e.getKey()))
                        .totalCost(costByVehicle.getOrDefault(e.getKey(), BigDecimal.ZERO))
                        .repairCount(countByVehicle.getOrDefault(e.getKey(), 0L))
                        .build())
                .sorted((a, b) -> b.getTotalCost().compareTo(a.getTotalCost()))
                .collect(Collectors.toList());

        // به تفکیک نوع سرویس
        List<VehicleRepairStatsResponse.PerType> perType = new ArrayList<>();
        for (Object[] row : repairRepository.sumByType(userId)) {
            VehicleRepairType type = (VehicleRepairType) row[0];
            perType.add(VehicleRepairStatsResponse.PerType.builder()
                    .repairType(type.name())
                    .repairTypePersian(typePersian(type))
                    .totalCost((BigDecimal) row[1])
                    .repairCount(((Number) row[2]).longValue())
                    .build());
        }

        // به تفکیک ماه
        List<VehicleRepairStatsResponse.PerMonth> perMonth = new ArrayList<>();
        for (Object[] row : repairRepository.sumByMonth(userId)) {
            perMonth.add(VehicleRepairStatsResponse.PerMonth.builder()
                    .month(String.valueOf(row[0]))
                    .totalCost((BigDecimal) row[1])
                    .repairCount(((Number) row[2]).longValue())
                    .build());
        }

        return VehicleRepairStatsResponse.builder()
                .totalCost(totalCost)
                .repairCount(repairCount)
                .vehicleCount(perVehicle.size())
                .perVehicle(perVehicle)
                .perType(perType)
                .perMonth(perMonth)
                .build();
    }

    @Override
    @Transactional
    public void deleteRepair(String ceoUsername, Long repairId) {
        User user = findUser(ceoUsername);
        VehicleRepairRecord record = repairRepository.findById(repairId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "سرویس یافت نشد"));

        if (!record.getVehicle().getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "شما اجازه حذف این سرویس را ندارید");
        }
        repairRepository.delete(record);
        log.info("Repair record {} deleted by {}", repairId, ceoUsername);
    }

    // ===================== helper ها =====================

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "کاربر یافت نشد"));
    }

    private String typePersian(VehicleRepairType type) {
        switch (type) {
            case ROUTINE_SERVICE: return "سرویس دوره‌ای";
            case REPAIR: return "تعمیر";
            case ACCIDENT: return "تصادف";
            default: return "سایر";
        }
    }

    private VehicleRepairResponse toResponse(VehicleRepairRecord r) {
        return VehicleRepairResponse.builder()
                .id(r.getId())
                .vehicleId(r.getVehicle().getId())
                .vehicleName(r.getVehicle().getName())
                .plateNumber(r.getVehicle().getPlateNumber())
                .repairDate(r.getRepairDate())
                .cost(r.getCost())
                .repairType(r.getRepairType().name())
                .repairTypePersian(typePersian(r.getRepairType()))
                .title(r.getTitle())
                .description(r.getDescription())
                .workshopName(r.getWorkshopName())
                .createdBy(r.getCreatedBy())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
