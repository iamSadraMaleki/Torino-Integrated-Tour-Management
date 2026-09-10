package com.example.project.profile.ceoinfo.model;


import com.example.project.users.model.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "bank_accounts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @NotBlank
    @Size(min = 3, max = 100)
    @Column(name = "account_holder_name", nullable = false, length = 100)
    private String accountHolderName; // نام صاحب حساب

    @NotBlank
    @Size(min = 2, max = 100)
    @Column(name = "bank_name", nullable = false, length = 100)
    private String bankName; // نام بانک

    @NotBlank
    @Pattern(regexp = "^\\d{10,16}$", message = "شماره حساب باید بین 10 تا 16 رقم باشد")
    @Column(name = "account_number", nullable = false, length = 16)
    private String accountNumber; // شماره حساب

    @NotBlank
    @Pattern(regexp = "^IR\\d{24}$", message = "شماره شبا باید با IR شروع شود و 26 کاراکتر باشد")
    @Column(name = "iban", nullable = false, length = 26, unique = true)
    private String iban; // شماره شبا (IBAN)

    @NotBlank
    @Pattern(regexp = "^\\d{16}$", message = "شماره کارت باید 16 رقم باشد")
    @Column(name = "card_number", nullable = false, length = 16)
    private String cardNumber; // شماره کارت

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
