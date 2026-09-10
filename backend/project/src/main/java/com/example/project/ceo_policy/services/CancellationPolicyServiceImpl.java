package com.example.project.ceo_policy.services;


import com.example.project.ceo_policy.dto.CancellationPolicyMapper;
import com.example.project.ceo_policy.dto.CancellationPolicyRequest;
import com.example.project.ceo_policy.dto.CancellationPolicyResponse;
import com.example.project.ceo_policy.model.CancellationPolicy;
import com.example.project.ceo_policy.model.CancellationPolicyClause;
import com.example.project.ceo_policy.repository.CancellationPolicyRepository;
import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.ceo_tour.tour.repository.TourRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CancellationPolicyServiceImpl implements CancellationPolicyService {

    private final CancellationPolicyRepository policyRepository;
    private final UserRepository userRepository;
    private final TourRepository tourRepository;
    private final CancellationPolicyMapper mapper;

    private User getCurrentUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    @Override
    @Transactional
    public CancellationPolicyResponse createPolicy(String username, CancellationPolicyRequest request) {
        User user = getCurrentUser(username);
        log.info("User [{}] is creating cancellation policy: {}", username, request.getPolicyName());

        // چک نام تکراری
        if (policyRepository.existsByUserIdAndPolicyNameIgnoreCase(user.getId(), request.getPolicyName())) {
            throw new DuplicatePolicyNameException("سیاستی با نام '" + request.getPolicyName() + "' قبلاً ثبت شده است");
        }

        CancellationPolicy policy = new CancellationPolicy();
        policy.setUser(user);
        mapper.toEntity(request, policy);

        // اگر این سیاست به عنوان پیش‌فرض انتخاب شده، بقیه را ریست کن
        if (Boolean.TRUE.equals(policy.getIsDefault())) {
            policyRepository.resetAllDefaultFlagsForUser(user.getId());
        }

        CancellationPolicy saved = policyRepository.save(policy);
        log.info("Policy created with id: {} for user: {}", saved.getId(), username);

        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public CancellationPolicyResponse updatePolicy(String username, Long policyId, CancellationPolicyRequest request) {
        User user = getCurrentUser(username);
        log.info("User [{}] updating policy id: {}", username, policyId);

        CancellationPolicy policy = policyRepository.findByIdAndUserId(policyId, user.getId())
                .orElseThrow(() -> new PolicyNotFoundException("سیاست با ID " + policyId + " یافت نشد"));

        // چک نام تکراری (به غیر از خود این سیاست)
        if (!policy.getPolicyName().equalsIgnoreCase(request.getPolicyName()) &&
                policyRepository.existsByUserIdAndPolicyNameIgnoreCase(user.getId(), request.getPolicyName())) {
            throw new DuplicatePolicyNameException("سیاستی با نام '" + request.getPolicyName() + "' قبلاً ثبت شده است");
        }

        mapper.toEntity(request, policy);

        // اگر این سیاست به عنوان پیش‌فرض انتخاب شده، بقیه را ریست کن
        if (Boolean.TRUE.equals(policy.getIsDefault())) {
            policyRepository.resetDefaultFlagForUser(user.getId(), policy.getId());
        }

        CancellationPolicy updated = policyRepository.save(policy);
        log.info("Policy updated: {}", updated.getId());

        return mapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deletePolicy(String username, Long policyId) {
        User user = getCurrentUser(username);
        log.info("User [{}] deleting policy id: {}", username, policyId);

        CancellationPolicy policy = policyRepository.findByIdAndUserId(policyId, user.getId())
                .orElseThrow(() -> new PolicyNotFoundException("سیاست با ID " + policyId + " یافت نشد"));

        policyRepository.delete(policy);
        log.info("Policy deleted: {}", policyId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CancellationPolicyResponse> getMyPolicies(String username) {
        User user = getCurrentUser(username);
        log.debug("Fetching all policies for user: {}", username);

        return policyRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CancellationPolicyResponse getPolicyById(String username, Long policyId) {
        User user = getCurrentUser(username);
        log.debug("Fetching policy id: {} for user: {}", policyId, username);

        CancellationPolicy policy = policyRepository.findByIdAndUserId(policyId, user.getId())
                .orElseThrow(() -> new PolicyNotFoundException("سیاست با ID " + policyId + " یافت نشد"));

        return mapper.toResponse(policy);
    }

    @Override
    @Transactional
    public CancellationPolicyResponse setDefaultPolicy(String username, Long policyId) {
        User user = getCurrentUser(username);
        log.info("User [{}] setting default policy to: {}", username, policyId);

        // ریست همه پیش‌فرض‌ها
        policyRepository.resetAllDefaultFlagsForUser(user.getId());

        // تنظیم سیاست جدید به عنوان پیش‌فرض
        CancellationPolicy policy = policyRepository.findByIdAndUserId(policyId, user.getId())
                .orElseThrow(() -> new PolicyNotFoundException("سیاست با ID " + policyId + " یافت نشد"));

        policy.setIsDefault(true);
        CancellationPolicy saved = policyRepository.save(policy);

        log.info("Default policy set to: {}", policyId);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CancellationPolicyResponse getDefaultPolicy(String username) {
        User user = getCurrentUser(username);
        log.debug("Fetching default policy for user: {}", username);

        CancellationPolicy policy = policyRepository.findByUserIdAndIsDefaultTrue(user.getId())
                .orElseThrow(() -> new PolicyNotFoundException("هیچ سیاست پیش‌فرضی تعریف نشده است"));

        return mapper.toResponse(policy);
    }
    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateRefundAmount(Long tourId, BigDecimal totalPrice, LocalDateTime cancellationTime) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("تور یافت نشد"));

        // گرفتن سیاست پیش‌فرض مدیر آژانس
        CancellationPolicy policy = policyRepository.findByUserIdAndIsDefaultTrue(tour.getCreatedBy().getId())
                .orElseThrow(() -> new RuntimeException("سیاست لغوی برای این تور تعریف نشده است"));

        // محاسبه ساعت باقی مانده تا حرکت
        LocalDateTime departureDateTime = tour.getDepartureDate().atStartOfDay();
        long hoursRemaining = java.time.Duration.between(cancellationTime, departureDateTime).toHours();

        List<CancellationPolicyClause> clauses = policy.getClauses();
        if (clauses == null || clauses.isEmpty()) {
            // سازگاری با سیاست‌های قدیمی (بدون بند)
            if (policy.getHoursBeforeDeparture() != null && policy.getRefundPercentage() != null) {
                if (hoursRemaining >= policy.getHoursBeforeDeparture()) {
                    return totalPrice.multiply(policy.getRefundPercentage())
                            .divide(BigDecimal.valueOf(100));
                }
            }
            return BigDecimal.ZERO;
        }

        // منطق پلکانی: مناسب‌ترین بند = بزرگ‌ترین آستانه‌ای که کمتر یا مساوی ساعت باقی‌مانده است
        CancellationPolicyClause applicable = null;
        for (CancellationPolicyClause clause : clauses) {
            if (hoursRemaining >= clause.getHoursBeforeDeparture()) {
                applicable = clause;
            }
        }

        // اگر از کوچک‌ترین آستانه هم کمتر مانده، هیچ مبلغی برگشت داده نمی‌شود
        if (applicable == null) {
            return BigDecimal.ZERO;
        }

        return totalPrice.multiply(applicable.getRefundPercentage())
                .divide(BigDecimal.valueOf(100));
    }
}
