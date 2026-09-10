package com.example.project.ceo_personel.controller;

import com.example.project.ceo_personel.dto.StaffMemberDto;
import com.example.project.ceo_personel.dto.StaffMemberRequest;
import com.example.project.ceo_personel.dto.StaffResponse;
import com.example.project.ceo_personel.dto.StaffStatisticsDto;
import com.example.project.ceo_personel.services.StaffMemberService;
import com.example.project.ceo_tour.tour_staff.dto.StaffTourHistoryResponseDTO;
import com.example.project.ceo_tour.tour_staff.services.TourStaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ceo/staff/members")
@RequiredArgsConstructor
public class StaffMemberController {

    private final StaffMemberService staffMemberService;
    private final TourStaffService tourStaffService;
    private static final Logger logger = LoggerFactory.getLogger(StaffMemberController.class);

    @PostMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> createStaffMember(@Valid @RequestBody StaffMemberRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} creating new staff member", username);

        StaffMemberDto staffMemberDto = staffMemberService.createStaffMember(username, request);

        StaffResponse response = StaffResponse.builder()
                .success(true)
                .message("کارمند با موفقیت ثبت شد")
                .data(staffMemberDto)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> getAllStaffMembers() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching all staff members", username);

        List<StaffMemberDto> staffMembers = staffMemberService.getAllStaffMembers(username);

        StaffResponse response = StaffResponse.builder()
                .success(true)
                .message("لیست کارمندان با موفقیت بازیابی شد")
                .data(staffMembers)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> getActiveStaffMembers() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching active staff members", username);

        List<StaffMemberDto> staffMembers = staffMemberService.getActiveStaffMembers(username);

        StaffResponse response = StaffResponse.builder()
                .success(true)
                .message("لیست کارمندان فعال با موفقیت بازیابی شد")
                .data(staffMembers)
                .build();

        return ResponseEntity.ok(response);
    }
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> getStatistics() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching staff statistics", username);

        StaffStatisticsDto statistics = staffMemberService.getStatistics(username);

        StaffResponse response = StaffResponse.builder()
                .success(true)
                .message("آمار با موفقیت بازیابی شد")
                .data(statistics)
                .build();

        return ResponseEntity.ok(response);
    }


    @GetMapping("/by-position/{positionId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> getStaffMembersByPosition(@PathVariable Long positionId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching staff members by position id: {}", username, positionId);

        List<StaffMemberDto> staffMembers = staffMemberService.getStaffMembersByPosition(username, positionId);

        StaffResponse response = StaffResponse.builder()
                .success(true)
                .message("لیست کارمندان با موفقیت بازیابی شد")
                .data(staffMembers)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{staffId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> getStaffMember(@PathVariable Long staffId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching staff member id: {}", username, staffId);

        StaffMemberDto staffMemberDto = staffMemberService.getStaffMemberById(username, staffId);

        StaffResponse response = StaffResponse.builder()
                .success(true)
                .message("اطلاعات با موفقیت بازیابی شد")
                .data(staffMemberDto)
                .build();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{staffId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> updateStaffMember(
            @PathVariable Long staffId,
            @Valid @RequestBody StaffMemberRequest request) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} updating staff member id: {}", username, staffId);

        StaffMemberDto staffMemberDto = staffMemberService.updateStaffMember(username, staffId, request);

        StaffResponse response = StaffResponse.builder()
                .success(true)
                .message("کارمند با موفقیت ویرایش شد")
                .data(staffMemberDto)
                .build();

        return ResponseEntity.ok(response);
    }

    /** تاریخچه سفرهای یک کارمند — تورهایی که در آن‌ها تخصیص داده شده */
    @GetMapping("/{staffId}/tours")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> getStaffTourHistory(@PathVariable Long staffId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching tour history for staff id: {}", username, staffId);

        List<StaffTourHistoryResponseDTO> tours = tourStaffService.getToursByStaff(username, staffId);

        StaffResponse response = StaffResponse.builder()
                .success(true)
                .message("تاریخچه سفرهای کارمند")
                .data(tours)
                .build();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{staffId}")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<StaffResponse> deleteStaffMember(@PathVariable Long staffId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} deleting staff member id: {}", username, staffId);

        staffMemberService.deleteStaffMember(username, staffId);

        StaffResponse response = StaffResponse.builder()
                .success(true)
                .message("کارمند با موفقیت حذف شد")
                .data(null)
                .build();

        return ResponseEntity.ok(response);
    }
}
