package com.example.project.profile.ceoinfo.mapper;


import com.example.project.profile.ceoinfo.dto.BankAccountDto;
import com.example.project.profile.ceoinfo.model.BankAccount;
import org.springframework.stereotype.Component;

@Component
public class BankAccountMapper {

    public BankAccountDto toDto(BankAccount bankAccount) {
        if (bankAccount == null) {
            return null;
        }

        Long userId = null;
        String username = null;
        if (bankAccount.getUser() != null) {
            userId = bankAccount.getUser().getId();
            username = bankAccount.getUser().getUsername();
        }

        return BankAccountDto.builder()
                .id(bankAccount.getId())
                .userId(userId)
                .username(username)
                .accountHolderName(bankAccount.getAccountHolderName())
                .bankName(bankAccount.getBankName())
                .accountNumber(bankAccount.getAccountNumber())
                .iban(bankAccount.getIban())
                .cardNumber(bankAccount.getCardNumber())
                .createdAt(bankAccount.getCreatedAt())
                .updatedAt(bankAccount.getUpdatedAt())
                .build();
    }
}

