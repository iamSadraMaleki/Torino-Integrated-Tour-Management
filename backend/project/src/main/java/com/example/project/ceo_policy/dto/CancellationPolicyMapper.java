package com.example.project.ceo_policy.dto;

import com.example.project.ceo_policy.model.CancellationPolicy;
import com.example.project.ceo_policy.model.CancellationPolicyClause;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CancellationPolicyMapper {

    public CancellationPolicyResponse toResponse(CancellationPolicy policy) {
        List<CancellationPolicyClauseDto> clauses = policy.getClauses().stream()
                .map(this::toClauseDto)
                .collect(Collectors.toList());

        // سازگاری با سیاست‌های قدیمی که بند ندارند — یک بند از فیلدهای قدیمی می‌سازیم
        if (clauses.isEmpty() && policy.getHoursBeforeDeparture() != null && policy.getRefundPercentage() != null) {
            CancellationPolicyClauseDto legacy = new CancellationPolicyClauseDto();
            legacy.setHoursBeforeDeparture(policy.getHoursBeforeDeparture());
            legacy.setRefundPercentage(policy.getRefundPercentage());
            clauses = List.of(legacy);
        }

        return CancellationPolicyResponse.builder()
                .id(policy.getId())
                .policyName(policy.getPolicyName())
                .description(policy.getDescription())
                .clauses(clauses)
                .hoursBeforeDeparture(policy.getHoursBeforeDeparture())
                .refundPercentage(policy.getRefundPercentage())
                .isDefault(policy.getIsDefault())
                .isActive(policy.getIsActive())
                .createdAt(policy.getCreatedAt())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }

    public CancellationPolicy toEntity(CancellationPolicyRequest request, CancellationPolicy policy) {
        policy.setPolicyName(request.getPolicyName());
        policy.setDescription(request.getDescription());
        policy.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);
        policy.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        updateClauses(policy, request);
        return policy;
    }

    /**
     * بازسازی بندهای سیاست از درخواست.
     * اگر درخواست بند نداشته باشد (سازگاری)، از فیلدهای قدیمی یک بند ساخته می‌شود.
     * فیلدهای قدیمی همیشه از «بند با بیشترین ساعت» همگام می‌شوند تا نال نباشند.
     */
    public void updateClauses(CancellationPolicy policy, CancellationPolicyRequest request) {
        List<CancellationPolicyClauseDto> clauseDtos = request.getClauses();
        if (clauseDtos == null || clauseDtos.isEmpty()) {
            if (request.getHoursBeforeDeparture() != null && request.getRefundPercentage() != null) {
                CancellationPolicyClauseDto legacy = new CancellationPolicyClauseDto();
                legacy.setHoursBeforeDeparture(request.getHoursBeforeDeparture());
                legacy.setRefundPercentage(request.getRefundPercentage());
                clauseDtos = List.of(legacy);
            } else {
                clauseDtos = new ArrayList<>();
            }
        }

        policy.getClauses().clear();
        for (CancellationPolicyClauseDto dto : clauseDtos) {
            CancellationPolicyClause clause = new CancellationPolicyClause();
            clause.setPolicy(policy);
            clause.setHoursBeforeDeparture(dto.getHoursBeforeDeparture());
            clause.setRefundPercentage(dto.getRefundPercentage());
            policy.getClauses().add(clause);
        }

        // همگام‌سازی فیلدهای قدیمی از بند با بیشترین ساعت (سازگاری + نال نبودن)
        CancellationPolicyClause maxThreshold = policy.getClauses().stream()
                .max(Comparator.comparing(CancellationPolicyClause::getHoursBeforeDeparture))
                .orElse(null);
        if (maxThreshold != null) {
            policy.setHoursBeforeDeparture(maxThreshold.getHoursBeforeDeparture());
            policy.setRefundPercentage(maxThreshold.getRefundPercentage());
        }
    }

    public CancellationPolicyClauseDto toClauseDto(CancellationPolicyClause clause) {
        CancellationPolicyClauseDto dto = new CancellationPolicyClauseDto();
        dto.setId(clause.getId());
        dto.setHoursBeforeDeparture(clause.getHoursBeforeDeparture());
        dto.setRefundPercentage(clause.getRefundPercentage());
        return dto;
    }
}