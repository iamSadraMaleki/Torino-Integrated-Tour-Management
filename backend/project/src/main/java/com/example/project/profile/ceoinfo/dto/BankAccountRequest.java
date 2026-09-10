package com.example.project.profile.ceoinfo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BankAccountRequest {

    @NotBlank(message = "نام صاحب حساب الزامی است")
    @Size(min = 3, max = 100, message = "نام صاحب حساب باید بین 3 تا 100 کاراکتر باشد")
    private String accountHolderName;

    @NotBlank(message = "نام بانک الزامی است")
    @Size(min = 2, max = 100, message = "نام بانک باید بین 2 تا 100 کاراکتر باشد")
    private String bankName;

    @NotBlank(message = "شماره حساب الزامی است")
    @Pattern(regexp = "^\\d{10,16}$", message = "شماره حساب باید بین 10 تا 16 رقم باشد")
    private String accountNumber;

    @NotBlank(message = "شماره شبا الزامی است")
    @Pattern(regexp = "^IR\\d{24}$", message = "شماره شبا باید با IR شروع شود و 26 کاراکتر باشد")
    private String iban;

    @NotBlank(message = "شماره کارت الزامی است")
    @Pattern(regexp = "^\\d{16}$", message = "شماره کارت باید 16 رقم باشد")
    private String cardNumber;
}

