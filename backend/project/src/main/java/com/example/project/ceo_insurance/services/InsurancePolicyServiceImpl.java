package com.example.project.ceo_insurance.services;

import com.example.project.ceo_insurance.dto.InsurancePolicyDto;
import com.example.project.ceo_insurance.dto.InsurancePolicyRequest;
import com.example.project.ceo_insurance.model.InsurancePolicy;
import com.example.project.ceo_insurance.model.InsurancePolicyType;
import com.example.project.ceo_insurance.repository.InsurancePolicyRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InsurancePolicyServiceImpl implements InsurancePolicyService {

    private final InsurancePolicyRepository insuranceRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public InsurancePolicyDto create(String ceoUsername, InsurancePolicyRequest request) {
        User user = findUser(ceoUsername);

        if (insuranceRepository.existsByUserIdAndName(user.getId(), request.getName().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "بیمه‌نامه‌ای با این نام قبلاً ثبت شده است");
        }

        InsurancePolicy policy = InsurancePolicy.builder()
                .user(user)
                .name(request.getName().trim())
                .insuranceType(parseType(request.getInsuranceType()))
                .coverageAmount(request.getCoverageAmount())
                .premium(request.getPremium())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .build();

        policy = insuranceRepository.save(policy);
        log.info("Insurance policy [{}] created by {}", policy.getName(), ceoUsername);
        return toDto(policy);
    }

    @Override
    @Transactional
    public InsurancePolicyDto update(String ceoUsername, Long policyId, InsurancePolicyRequest request) {
        User user = findUser(ceoUsername);
        InsurancePolicy policy = insuranceRepository.findByIdAndUserId(policyId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "بیمه‌نامه پیدا نشد یا متعلق به شما نیست"));

        policy.setName(request.getName().trim());
        policy.setInsuranceType(parseType(request.getInsuranceType()));
        policy.setCoverageAmount(request.getCoverageAmount());
        policy.setPremium(request.getPremium());
        policy.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);

        policy = insuranceRepository.save(policy);
        log.info("Insurance policy [{}] updated by {}", policyId, ceoUsername);
        return toDto(policy);
    }

    @Override
    @Transactional
    public void delete(String ceoUsername, Long policyId) {
        User user = findUser(ceoUsername);
        InsurancePolicy policy = insuranceRepository.findByIdAndUserId(policyId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "بیمه‌نامه پیدا نشد یا متعلق به شما نیست"));
        insuranceRepository.delete(policy);
        log.info("Insurance policy [{}] deleted by {}", policyId, ceoUsername);
    }

    @Override
    @Transactional(readOnly = true)
    public InsurancePolicyDto getById(String ceoUsername, Long policyId) {
        User user = findUser(ceoUsername);
        InsurancePolicy policy = insuranceRepository.findByIdAndUserId(policyId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "بیمه‌نامه پیدا نشد یا متعلق به شما نیست"));
        return toDto(policy);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InsurancePolicyDto> getAll(String ceoUsername) {
        User user = findUser(ceoUsername);
        return insuranceRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ===================== helper ها =====================

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "کاربر یافت نشد"));
    }

    private InsurancePolicyType parseType(String type) {
        try {
            return InsurancePolicyType.valueOf(type != null ? type.trim().toUpperCase() : "");
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "نوع بیمه نامعتبر است — باید TRAVEL، HEALTH، ACCIDENT یا OTHER باشد");
        }
    }

    private String typePersian(InsurancePolicyType type) {
        switch (type) {
            case TRAVEL: return "بیمه مسافرتی";
            case HEALTH: return "بیمه درمانی";
            case ACCIDENT: return "بیمه حوادث";
            default: return "سایر";
        }
    }

    private InsurancePolicyDto toDto(InsurancePolicy policy) {
        return InsurancePolicyDto.builder()
                .id(policy.getId())
                .name(policy.getName())
                .insuranceType(policy.getInsuranceType().name())
                .insuranceTypePersian(typePersian(policy.getInsuranceType()))
                .coverageAmount(policy.getCoverageAmount())
                .premium(policy.getPremium())
                .description(policy.getDescription())
                .createdAt(policy.getCreatedAt())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }
}
