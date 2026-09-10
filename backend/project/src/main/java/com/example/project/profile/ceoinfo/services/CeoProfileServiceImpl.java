package com.example.project.profile.ceoinfo.services;


import com.example.project.profile.ceoinfo.dto.CeoProfileDto;
import com.example.project.profile.ceoinfo.dto.CeoProfileRequest;
import com.example.project.profile.ceoinfo.mapper.CeoProfileMapper;
import com.example.project.profile.ceoinfo.model.CeoProfile;
import com.example.project.profile.ceoinfo.repository.CeoProfileRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Field;

@Service
@RequiredArgsConstructor
public class CeoProfileServiceImpl implements CeoProfileService {

    private final CeoProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final CeoProfileMapper profileMapper;
    private final AuditLogService auditLogService;
    private static final Logger logger = LoggerFactory.getLogger(CeoProfileServiceImpl.class);

    @Override
    @Transactional
    public CeoProfileDto createProfile(String username, CeoProfileRequest request, HttpServletRequest httpRequest) {
        logger.info("Creating CEO profile for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        // بررسی اینکه قبلاً پروفایل ثبت نکرده باشه
        if (profileRepository.existsByUserId(user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "پروفایل قبلاً ثبت شده است");
        }

        // بررسی تکراری نبودن کد ملی
        if (profileRepository.existsByNationalCode(request.getNationalCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "این کد ملی قبلاً ثبت شده است");
        }

        CeoProfile profile = CeoProfile.builder()
                .user(user)
                .fullName(request.getFullName())
                .nationalCode(request.getNationalCode())
                .birthDate(request.getBirthDate())
                .phoneNumber(request.getPhoneNumber())
                .build();

        CeoProfile saved = profileRepository.save(profile);

        // ثبت لاگ ایجاد
        String ipAddress = getClientIp(httpRequest);
        auditLogService.logChange(user, "CeoProfile", saved.getId(),
                "ALL", null, "CREATED", "CREATE", ipAddress);

        logger.info("CEO profile created successfully for user: {}", username);
        return profileMapper.toDto(saved);
    }

    @Override
    @Transactional
    public CeoProfileDto updateProfile(String username, CeoProfileRequest request, HttpServletRequest httpRequest) {
        logger.info("Updating CEO profile for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        CeoProfile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "پروفایل پیدا نشد"));

        String ipAddress = getClientIp(httpRequest);

        // ثبت تغییرات هر فیلد
        logFieldChange(profile, user, "fullName", profile.getFullName(),
                request.getFullName(), ipAddress);
        logFieldChange(profile, user, "nationalCode", profile.getNationalCode(),
                request.getNationalCode(), ipAddress);
        logFieldChange(profile, user, "birthDate",
                profile.getBirthDate() != null ? profile.getBirthDate().toString() : null,
                request.getBirthDate() != null ? request.getBirthDate().toString() : null,
                ipAddress);
        logFieldChange(profile, user, "phoneNumber", profile.getPhoneNumber(),
                request.getPhoneNumber(), ipAddress);

        profile.setFullName(request.getFullName());
        profile.setNationalCode(request.getNationalCode());
        profile.setBirthDate(request.getBirthDate());
        profile.setPhoneNumber(request.getPhoneNumber());

        CeoProfile updated = profileRepository.save(profile);
        logger.info("CEO profile updated successfully for user: {}", username);

        return profileMapper.toDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public CeoProfileDto getProfile(String username) {
        logger.info("Fetching CEO profile for user: {}", username);

        CeoProfile profile = profileRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "پروفایل پیدا نشد"));

        return profileMapper.toDto(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public CeoProfileDto getProfileById(Long profileId) {
        logger.info("Fetching CEO profile by id: {}", profileId);

        CeoProfile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "پروفایل پیدا نشد"));

        return profileMapper.toDto(profile);
    }

    @Override
    @Transactional
    public void deleteProfile(String username) {
        logger.info("Deleting CEO profile for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        CeoProfile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "پروفایل پیدا نشد"));

        profileRepository.delete(profile);
        logger.info("CEO profile deleted successfully for user: {}", username);
    }

    private void logFieldChange(CeoProfile profile, User user, String fieldName,
                                String oldValue, String newValue, String ipAddress) {
        if (!java.util.Objects.equals(oldValue, newValue)) {
            auditLogService.logChange(user, "CeoProfile", profile.getId(),
                    fieldName, oldValue, newValue, "UPDATE", ipAddress);
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}

