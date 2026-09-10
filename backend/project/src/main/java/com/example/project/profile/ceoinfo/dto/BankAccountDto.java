package com.example.project.profile.ceoinfo.dto;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankAccountDto {
    private Long id;
    private Long userId;
    private String username;
    private String accountHolderName;
    private String bankName;
    private String accountNumber;
    private String iban;
    private String cardNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
