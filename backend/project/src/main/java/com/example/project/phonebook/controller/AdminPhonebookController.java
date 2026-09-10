package com.example.project.phonebook.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.phonebook.dto.PhonebookContactResponse;
import com.example.project.phonebook.dto.PhonebookJobResponse;
import com.example.project.phonebook.services.PhonebookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin/phonebook")
@RequiredArgsConstructor
public class AdminPhonebookController {

    private final PhonebookService phonebookService;

    /** همه مخاطبین همه کاربران (مانیتورینگ) */
    @GetMapping("/contacts")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<ApiResponse<List<PhonebookContactResponse>>> getAllContacts() {
        List<PhonebookContactResponse> data = phonebookService.getAllContacts();
        return ResponseEntity.ok(ApiResponse.ok("همه مخاطبین دفترچه تلفن", data));
    }

    /** همه سمتها و مشاغل همه کاربران (مانیتورینگ) */
    @GetMapping("/jobs")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<ApiResponse<List<PhonebookJobResponse>>> getAllJobs() {
        List<PhonebookJobResponse> data = phonebookService.getAllJobs();
        return ResponseEntity.ok(ApiResponse.ok("همه سمتها و مشاغل", data));
    }
}
