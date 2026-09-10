package com.example.project.ceo_car.services;


import com.example.project.ceo_car.dto.VehicleDto;
import com.example.project.ceo_car.dto.VehicleMapper;
import com.example.project.ceo_car.dto.VehicleRequest;
import com.example.project.ceo_car.dto.VehicleStatisticsDto;
import com.example.project.ceo_car.model.Vehicle;
import com.example.project.ceo_car.model.VehicleFeature;
import com.example.project.ceo_car.model.VehicleStatus;
import com.example.project.ceo_car.model.VehicleType;
import com.example.project.ceo_car.repository.VehicleFeatureRepository;
import com.example.project.ceo_car.repository.VehicleRepository;
import com.example.project.ceo_personel.model.StaffMember;
import com.example.project.ceo_personel.repository.StaffMemberRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleFeatureRepository featureRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final UserRepository userRepository;
    private final VehicleMapper vehicleMapper;
    private static final Logger logger = LoggerFactory.getLogger(VehicleServiceImpl.class);

    @Override
    @Transactional
    public VehicleDto createVehicle(String username, VehicleRequest request) {
        logger.info("Creating vehicle for CEO: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        // بررسی تکراری نبودن پلاک
        if (vehicleRepository.existsByUserIdAndPlateNumber(user.getId(), request.getPlateNumber())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "ماشینی با این پلاک قبلاً ثبت شده است");
        }

        Vehicle vehicle = Vehicle.builder()
                .user(user)
                .name(request.getName())
                .manufacturer(request.getManufacturer())
                .type(request.getType())
                .status(request.getStatus())
                .plateNumber(request.getPlateNumber())
                .color(request.getColor())
                .rowCount(request.getRowCount())
                .seatCount(request.getSeatCount())
                .modelYear(request.getModelYear())
                .description(request.getDescription())
                .features(new HashSet<>())
                .build();

        // تنظیم راننده فعلی (اگر مشخص شده)
        if (request.getCurrentDriverId() != null) {
            StaffMember driver = staffMemberRepository.findByIdAndUserId(
                            request.getCurrentDriverId(), user.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "راننده مورد نظر پیدا نشد"));
            vehicle.setCurrentDriver(driver);
        }

        // اضافه کردن ویژگی‌ها
        if (request.getFeatureIds() != null && !request.getFeatureIds().isEmpty()) {
            Set<VehicleFeature> features = request.getFeatureIds().stream()
                    .map(featureId -> featureRepository.findByIdAndUserId(featureId, user.getId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                    "ویژگی با شناسه " + featureId + " پیدا نشد")))
                    .collect(Collectors.toSet());
            vehicle.setFeatures(features);
        }

        Vehicle saved = vehicleRepository.save(vehicle);
        logger.info("Vehicle created successfully with id: {}", saved.getId());

        return vehicleMapper.toDto(saved);
    }

    @Override
    @Transactional
    public VehicleDto updateVehicle(String username, Long vehicleId, VehicleRequest request) {
        logger.info("Updating vehicle id: {} for CEO: {}", vehicleId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ماشین پیدا نشد"));

        // بررسی تکراری نبودن پلاک (اگر تغییر کرده باشد)
        if (!vehicle.getPlateNumber().equals(request.getPlateNumber())) {
            if (vehicleRepository.existsByUserIdAndPlateNumber(user.getId(), request.getPlateNumber())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "ماشینی با این پلاک قبلاً ثبت شده است");
            }
        }

        // آپدیت فیلدها
        vehicle.setName(request.getName());
        vehicle.setManufacturer(request.getManufacturer());
        vehicle.setType(request.getType());
        vehicle.setStatus(request.getStatus());
        vehicle.setPlateNumber(request.getPlateNumber());
        vehicle.setColor(request.getColor());
        vehicle.setRowCount(request.getRowCount());
        vehicle.setSeatCount(request.getSeatCount());
        vehicle.setModelYear(request.getModelYear());
        vehicle.setDescription(request.getDescription());

        // تنظیم راننده فعلی
        if (request.getCurrentDriverId() != null) {
            StaffMember driver = staffMemberRepository.findByIdAndUserId(
                            request.getCurrentDriverId(), user.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "راننده مورد نظر پیدا نشد"));
            vehicle.setCurrentDriver(driver);
        } else {
            vehicle.setCurrentDriver(null);
        }

        // آپدیت ویژگی‌ها
        if (request.getFeatureIds() != null) {
            vehicle.getFeatures().clear();
            if (!request.getFeatureIds().isEmpty()) {
                Set<VehicleFeature> features = request.getFeatureIds().stream()
                        .map(featureId -> featureRepository.findByIdAndUserId(featureId, user.getId())
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                        "ویژگی با شناسه " + featureId + " پیدا نشد")))
                        .collect(Collectors.toSet());
                vehicle.setFeatures(features);
            }
        }

        Vehicle updated = vehicleRepository.save(vehicle);
        logger.info("Vehicle updated successfully");

        return vehicleMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void deleteVehicle(String username, Long vehicleId) {
        logger.info("Deleting vehicle id: {} for CEO: {}", vehicleId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ماشین پیدا نشد"));

        vehicleRepository.delete(vehicle);
        logger.info("Vehicle deleted successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleDto getVehicleById(String username, Long vehicleId) {
        logger.info("Fetching vehicle id: {} for CEO: {}", vehicleId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ماشین پیدا نشد"));

        return vehicleMapper.toDto(vehicle);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleDto> getAllVehicles(String username) {
        logger.info("Fetching all vehicles for CEO: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        return vehicleRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(vehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleDto> getVehiclesByStatus(String username, VehicleStatus status) {
        logger.info("Fetching vehicles by status {} for CEO: {}", status, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        return vehicleRepository.findByUserIdAndStatusOrderByNameAsc(user.getId(), status)
                .stream()
                .map(vehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleDto> getVehiclesByType(String username, VehicleType type) {
        logger.info("Fetching vehicles by type {} for CEO: {}", type, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        return vehicleRepository.findByUserIdAndTypeOrderByNameAsc(user.getId(), type)
                .stream()
                .map(vehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleStatisticsDto getStatistics(String username) {
        logger.info("Fetching vehicle statistics for CEO: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        List<Vehicle> allVehicles = vehicleRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        long totalVehicles = allVehicles.size();
        long activeVehicles = vehicleRepository.countByUserIdAndStatus(user.getId(), VehicleStatus.ACTIVE);
        long underRepairVehicles = vehicleRepository.countByUserIdAndStatus(user.getId(), VehicleStatus.UNDER_REPAIR);
        long inactiveVehicles = vehicleRepository.countByUserIdAndStatus(user.getId(), VehicleStatus.INACTIVE);

        // آمار به تفکیک نوع
        List<Object[]> typeData = vehicleRepository.countByTypeForUser(user.getId());
        Map<String, Long> vehiclesByType = new HashMap<>();
        for (Object[] row : typeData) {
            vehiclesByType.put(row[0].toString(), (Long) row[1]);
        }

        // آمار به تفکیک شرکت سازنده
        List<Object[]> manufacturerData = vehicleRepository.countByManufacturerForUser(user.getId());
        Map<String, Long> vehiclesByManufacturer = new HashMap<>();
        for (Object[] row : manufacturerData) {
            vehiclesByManufacturer.put((String) row[0], (Long) row[1]);
        }

        // آمار به تفکیک وضعیت
        List<Object[]> statusData = vehicleRepository.countByStatusForUser(user.getId());
        Map<String, Long> vehiclesByStatus = new HashMap<>();
        for (Object[] row : statusData) {
            vehiclesByStatus.put(row[0].toString(), (Long) row[1]);
        }

        // تعداد کل صندلی‌ها
        int totalSeats = allVehicles.stream()
                .mapToInt(Vehicle::getSeatCount)
                .sum();

        return VehicleStatisticsDto.builder()
                .totalVehicles(totalVehicles)
                .activeVehicles(activeVehicles)
                .underRepairVehicles(underRepairVehicles)
                .inactiveVehicles(inactiveVehicles)
                .vehiclesByType(vehiclesByType)
                .vehiclesByManufacturer(vehiclesByManufacturer)
                .vehiclesByStatus(vehiclesByStatus)
                .totalSeats(totalSeats)
                .build();
    }
}
