package com.example.project.phonebook.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.phonebook.dto.*;
import com.example.project.phonebook.services.PhonebookService;
import com.example.project.users.config.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/phonebook")
@RequiredArgsConstructor
public class PhonebookController {

    private final PhonebookService phonebookService;
    private final SecurityUtils securityUtils;

    // ============ سمتها و مشاغل ============

    @GetMapping("/jobs")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_CEO')")
    public ResponseEntity<ApiResponse<List<PhonebookJobResponse>>> getJobs() {
        List<PhonebookJobResponse> data = phonebookService.getJobs(securityUtils.currentUsername());
        return ResponseEntity.ok(ApiResponse.ok("لیست سمتها", data));
    }

    @PostMapping("/jobs")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_CEO')")
    public ResponseEntity<ApiResponse<PhonebookJobResponse>> createJob(
            @Valid @RequestBody PhonebookJobRequest request) {
        PhonebookJobResponse data = phonebookService.createJob(securityUtils.currentUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("سمت با موفقیت ثبت شد", data));
    }

    @PutMapping("/jobs/{jobId}")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_CEO')")
    public ResponseEntity<ApiResponse<PhonebookJobResponse>> updateJob(
            @PathVariable Long jobId,
            @Valid @RequestBody PhonebookJobRequest request) {
        PhonebookJobResponse data = phonebookService.updateJob(securityUtils.currentUsername(), jobId, request);
        return ResponseEntity.ok(ApiResponse.ok("سمت با موفقیت ویرایش شد", data));
    }

    @DeleteMapping("/jobs/{jobId}")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_CEO')")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable Long jobId) {
        phonebookService.deleteJob(securityUtils.currentUsername(), jobId);
        return ResponseEntity.ok(ApiResponse.ok("سمت حذف شد", null));
    }

    // ============ مخاطبین دفترچه تلفن ============

    @GetMapping("/contacts")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_CEO')")
    public ResponseEntity<ApiResponse<List<PhonebookContactResponse>>> getContacts() {
        List<PhonebookContactResponse> data = phonebookService.getContacts(securityUtils.currentUsername());
        return ResponseEntity.ok(ApiResponse.ok("لیست مخاطبین", data));
    }

    @PostMapping("/contacts")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_CEO')")
    public ResponseEntity<ApiResponse<PhonebookContactResponse>> createContact(
            @Valid @RequestBody PhonebookContactRequest request) {
        PhonebookContactResponse data = phonebookService.createContact(securityUtils.currentUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("مخاطب با موفقیت ثبت شد", data));
    }

    @PutMapping("/contacts/{contactId}")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_CEO')")
    public ResponseEntity<ApiResponse<PhonebookContactResponse>> updateContact(
            @PathVariable Long contactId,
            @Valid @RequestBody PhonebookContactRequest request) {
        PhonebookContactResponse data = phonebookService.updateContact(securityUtils.currentUsername(), contactId, request);
        return ResponseEntity.ok(ApiResponse.ok("مخاطب با موفقیت ویرایش شد", data));
    }

    @DeleteMapping("/contacts/{contactId}")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_CEO')")
    public ResponseEntity<ApiResponse<Void>> deleteContact(@PathVariable Long contactId) {
        phonebookService.deleteContact(securityUtils.currentUsername(), contactId);
        return ResponseEntity.ok(ApiResponse.ok("مخاطب حذف شد", null));
    }
}
