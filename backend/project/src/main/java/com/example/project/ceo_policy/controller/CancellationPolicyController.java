package com.example.project.ceo_policy.controller;


import com.example.project.ceo_policy.dto.CancellationPolicyRequest;
import com.example.project.ceo_policy.dto.CancellationPolicyResponse;
import com.example.project.ceo_policy.services.CancellationPolicyService;
import com.example.project.ceo_tour.station.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/ceo/policies")
@RequiredArgsConstructor
public class CancellationPolicyController {

    private final CancellationPolicyService policyService;

    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CancellationPolicyResponse>> create(
            @Valid @RequestBody CancellationPolicyRequest request) {
        log.info("POST /api/ceo/policies - Creating policy: {}", request.getPolicyName());
        var data = policyService.createPolicy(currentUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("سیاست لغو با موفقیت ایجاد شد", data));
    }

    @PutMapping("/{policyId}")
    public ResponseEntity<ApiResponse<CancellationPolicyResponse>> update(
            @PathVariable Long policyId,
            @Valid @RequestBody CancellationPolicyRequest request) {
        log.info("PUT /api/ceo/policies/{} - Updating policy", policyId);
        var data = policyService.updatePolicy(currentUsername(), policyId, request);
        return ResponseEntity.ok(ApiResponse.ok("سیاست لغو با موفقیت به‌روزرسانی شد", data));
    }

    @DeleteMapping("/{policyId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long policyId) {
        log.info("DELETE /api/ceo/policies/{} - Deleting policy", policyId);
        policyService.deletePolicy(currentUsername(), policyId);
        return ResponseEntity.ok(ApiResponse.ok("سیاست لغو با موفقیت حذف شد", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CancellationPolicyResponse>>> getAll() {
        log.debug("GET /api/ceo/policies - Fetching all policies");
        var data = policyService.getMyPolicies(currentUsername());
        return ResponseEntity.ok(ApiResponse.ok("لیست سیاست‌های لغو", data));
    }

    @GetMapping("/{policyId}")
    public ResponseEntity<ApiResponse<CancellationPolicyResponse>> getById(@PathVariable Long policyId) {
        log.debug("GET /api/ceo/policies/{} - Fetching policy", policyId);
        var data = policyService.getPolicyById(currentUsername(), policyId);
        return ResponseEntity.ok(ApiResponse.ok("سیاست لغو", data));
    }

    @PatchMapping("/{policyId}/set-default")
    public ResponseEntity<ApiResponse<CancellationPolicyResponse>> setDefault(@PathVariable Long policyId) {
        log.info("PATCH /api/ceo/policies/{}/set-default - Setting as default", policyId);
        var data = policyService.setDefaultPolicy(currentUsername(), policyId);
        return ResponseEntity.ok(ApiResponse.ok("سیاست پیش‌فرض با موفقیت تنظیم شد", data));
    }

    @GetMapping("/default")
    public ResponseEntity<ApiResponse<CancellationPolicyResponse>> getDefault() {
        log.debug("GET /api/ceo/policies/default - Fetching default policy");
        var data = policyService.getDefaultPolicy(currentUsername());
        return ResponseEntity.ok(ApiResponse.ok("سیاست پیش‌فرض لغو", data));
    }
}