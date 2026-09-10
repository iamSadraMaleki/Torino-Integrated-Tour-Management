package com.example.project.ceo_car.services;

import com.example.project.ceo_car.dto.VehicleFeatureDto;
import com.example.project.ceo_car.dto.VehicleFeatureMapper;
import com.example.project.ceo_car.dto.VehicleFeatureRequest;
import com.example.project.ceo_car.model.VehicleFeature;
import com.example.project.ceo_car.repository.VehicleFeatureRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleFeatureServiceImpl implements VehicleFeatureService {

    private final VehicleFeatureRepository featureRepository;
    private final UserRepository userRepository;
    private final VehicleFeatureMapper featureMapper;
    private static final Logger logger = LoggerFactory.getLogger(VehicleFeatureServiceImpl.class);

    @Override
    @Transactional
    public VehicleFeatureDto createFeature(String username, VehicleFeatureRequest request) {
        logger.info("Creating vehicle feature for CEO: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        // بررسی تکراری نبودن نام ویژگی
        if (featureRepository.existsByUserIdAndName(user.getId(), request.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "ویژگی با این نام قبلاً ثبت شده است");
        }

        VehicleFeature feature = VehicleFeature.builder()
                .user(user)
                .name(request.getName())
                .description(request.getDescription())
                .icon(request.getIcon())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        VehicleFeature saved = featureRepository.save(feature);
        logger.info("Vehicle feature created successfully with id: {}", saved.getId());

        return featureMapper.toDto(saved);
    }

    @Override
    @Transactional
    public VehicleFeatureDto updateFeature(String username, Long featureId, VehicleFeatureRequest request) {
        logger.info("Updating vehicle feature id: {} for CEO: {}", featureId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        VehicleFeature feature = featureRepository.findByIdAndUserId(featureId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ویژگی پیدا نشد"));

        // بررسی تکراری نبودن نام (اگر تغییر کرده باشد)
        if (!feature.getName().equals(request.getName())) {
            if (featureRepository.existsByUserIdAndName(user.getId(), request.getName())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "ویژگی با این نام قبلاً ثبت شده است");
            }
        }

        feature.setName(request.getName());
        feature.setDescription(request.getDescription());
        feature.setIcon(request.getIcon());
        if (request.getIsActive() != null) {
            feature.setIsActive(request.getIsActive());
        }

        VehicleFeature updated = featureRepository.save(feature);
        logger.info("Vehicle feature updated successfully");

        return featureMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void deleteFeature(String username, Long featureId) {
        logger.info("Deleting vehicle feature id: {} for CEO: {}", featureId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        VehicleFeature feature = featureRepository.findByIdAndUserId(featureId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ویژگی پیدا نشد"));

        featureRepository.delete(feature);
        logger.info("Vehicle feature deleted successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleFeatureDto getFeatureById(String username, Long featureId) {
        logger.info("Fetching vehicle feature id: {} for CEO: {}", featureId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        VehicleFeature feature = featureRepository.findByIdAndUserId(featureId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ویژگی پیدا نشد"));

        return featureMapper.toDto(feature);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleFeatureDto> getAllFeatures(String username) {
        logger.info("Fetching all vehicle features for CEO: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        return featureRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(featureMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleFeatureDto> getActiveFeatures(String username) {
        logger.info("Fetching active vehicle features for CEO: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        return featureRepository.findByUserIdAndIsActiveTrueOrderByNameAsc(user.getId())
                .stream()
                .map(featureMapper::toDto)
                .collect(Collectors.toList());
    }
}

