package com.example.project.ceo_insurance.controller;

import com.example.project.ceo_insurance.dto.InsurancePolicyDto;
import com.example.project.ceo_insurance.dto.InsurancePolicyRequest;
import com.example.project.ceo_insurance.services.InsurancePolicyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * بیمه‌های سفر آژانس — CRUD بیمه‌نامه (فقط مدیر آژانس)
 */
@Slf4j
@RestController
@RequestMapping("/api/ceo/insurances")
@RequiredArgsConstructor
public class InsurancePolicyController {

    private final InsurancePolicyService insuranceService;

    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping
    public ResponseEntity<InsurancePolicyDto> create(@Valid @RequestBody InsurancePolicyRequest request) {
        log.info("POST /api/ceo/insurances - Creating insurance: {}", request.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(insuranceService.create(currentUsername(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InsurancePolicyDto> update(
            @PathVariable Long id,
            @Valid @RequestBody InsurancePolicyRequest request) {
        log.info("PUT /api/ceo/insurances/{} - Updating insurance", id);
        return ResponseEntity.ok(insuranceService.update(currentUsername(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /api/ceo/insurances/{} - Deleting insurance", id);
        insuranceService.delete(currentUsername(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<InsurancePolicyDto>> getAll() {
        log.debug("GET /api/ceo/insurances - Fetching insurances for current user");
        return ResponseEntity.ok(insuranceService.getAll(currentUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsurancePolicyDto> getById(@PathVariable Long id) {
        log.debug("GET /api/ceo/insurances/{} - Fetching insurance by id", id);
        return ResponseEntity.ok(insuranceService.getById(currentUsername(), id));
    }
}
