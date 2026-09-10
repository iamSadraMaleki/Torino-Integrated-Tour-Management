package com.example.project.profile.ceoinfo.services;


import com.example.project.profile.ceoinfo.dto.BankAccountDto;
import com.example.project.profile.ceoinfo.dto.BankAccountRequest;
import jakarta.servlet.http.HttpServletRequest;

public interface BankAccountService {

    BankAccountDto createBankAccount(String username, BankAccountRequest request, HttpServletRequest httpRequest);

    BankAccountDto updateBankAccount(String username, BankAccountRequest request, HttpServletRequest httpRequest);

    BankAccountDto getBankAccount(String username);

    BankAccountDto getBankAccountById(Long accountId);

    void deleteBankAccount(String username);
}

