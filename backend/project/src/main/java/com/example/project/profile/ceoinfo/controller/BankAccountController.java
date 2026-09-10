package com.example.project.profile.ceoinfo.controller;


import com.example.project.profile.ceoinfo.dto.AuditLogDto;
import com.example.project.profile.ceoinfo.dto.BankAccountDto;
import com.example.project.profile.ceoinfo.dto.BankAccountRequest;
import com.example.project.profile.ceoinfo.dto.CeoDataResponse;
import com.example.project.profile.ceoinfo.services.AuditLogService;
import com.example.project.profile.ceoinfo.services.BankAccountService;
import jakarta.servlet.http.HttpServletRequest;
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
@RequestMapping("/api/ceo/bank-account")
@RequiredArgsConstructor
public class BankAccountController {

    private final BankAccountService bankAccountService;
    private final AuditLogService auditLogService;
    private static final Logger logger = LoggerFactory.getLogger(BankAccountController.class);

    @PostMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<CeoDataResponse> createBankAccount(
            @Valid @RequestBody BankAccountRequest request,
            HttpServletRequest httpRequest) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} creating bank account", username);

        BankAccountDto bankAccountDto = bankAccountService.createBankAccount(username, request, httpRequest);

        CeoDataResponse response = CeoDataResponse.builder()
                .success(true)
                .message("اطلاعات بانکی با موفقیت ثبت شد")
                .data(bankAccountDto)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<CeoDataResponse> updateBankAccount(
            @Valid @RequestBody BankAccountRequest request,
            HttpServletRequest httpRequest) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} updating bank account", username);

        BankAccountDto bankAccountDto = bankAccountService.updateBankAccount(username, request, httpRequest);

        CeoDataResponse response = CeoDataResponse.builder()
                .success(true)
                .message("اطلاعات بانکی با موفقیت ویرایش شد")
                .data(bankAccountDto)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<CeoDataResponse> getBankAccount() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching bank account", username);

        BankAccountDto bankAccountDto = bankAccountService.getBankAccount(username);

        CeoDataResponse response = CeoDataResponse.builder()
                .success(true)
                .message("اطلاعات با موفقیت بازیابی شد")
                .data(bankAccountDto)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<CeoDataResponse> getBankAccountHistory() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} fetching bank account history", username);

        BankAccountDto bankAccountDto = bankAccountService.getBankAccount(username);
        List<AuditLogDto> history = auditLogService.getEntityHistory("BankAccount", bankAccountDto.getId());

        CeoDataResponse response = CeoDataResponse.builder()
                .success(true)
                .message("تاریخچه تغییرات با موفقیت بازیابی شد")
                .data(history)
                .build();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    @PreAuthorize("hasRole('ROLE_CEO')")
    public ResponseEntity<CeoDataResponse> deleteBankAccount() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("CEO {} deleting bank account", username);

        bankAccountService.deleteBankAccount(username);

        CeoDataResponse response = CeoDataResponse.builder()
                .success(true)
                .message("اطلاعات بانکی با موفقیت حذف شد")
                .data(null)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{accountId}")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<CeoDataResponse> getBankAccountById(@PathVariable Long accountId) {
        logger.info("SUPERADMIN fetching bank account with id: {}", accountId);

        BankAccountDto bankAccountDto = bankAccountService.getBankAccountById(accountId);

        CeoDataResponse response = CeoDataResponse.builder()
                .success(true)
                .message("اطلاعات با موفقیت بازیابی شد")
                .data(bankAccountDto)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{accountId}/history")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<CeoDataResponse> getBankAccountHistoryById(@PathVariable Long accountId) {
        logger.info("SUPERADMIN fetching bank account history with id: {}", accountId);

        List<AuditLogDto> history = auditLogService.getEntityHistory("BankAccount", accountId);

        CeoDataResponse response = CeoDataResponse.builder()
                .success(true)
                .message("تاریخچه تغییرات با موفقیت بازیابی شد")
                .data(history)
                .build();

        return ResponseEntity.ok(response);
    }
}

