package com.example.project.ceo_policy.services;

import com.example.project.ceo_policy.dto.CancellationPolicyRequest;
import com.example.project.ceo_policy.dto.CancellationPolicyResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface CancellationPolicyService {

    CancellationPolicyResponse createPolicy(String username, CancellationPolicyRequest request);

    CancellationPolicyResponse updatePolicy(String username, Long policyId, CancellationPolicyRequest request);

    void deletePolicy(String username, Long policyId);

    List<CancellationPolicyResponse> getMyPolicies(String username);

    CancellationPolicyResponse getPolicyById(String username, Long policyId);

    CancellationPolicyResponse setDefaultPolicy(String username, Long policyId);

    CancellationPolicyResponse getDefaultPolicy(String username);

    BigDecimal calculateRefundAmount(Long tourId, BigDecimal totalPrice, LocalDateTime cancellationTime);
}