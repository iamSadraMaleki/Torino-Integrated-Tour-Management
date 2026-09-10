package com.example.project.finance.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** یک تراکنش پرداخت در کل پلتفرم (رزروی که رسید پرداخت دارد) */
@Value
@Builder
public class FinanceTransactionDto {

    Long reservationId;
    String userUsername;
    String userMobile;
    String tourName;
    String tourCode;
    String agencyUsername;
    BigDecimal amount;
    String status;
    String statusPersian;
    LocalDateTime confirmedAt;
    LocalDateTime createdAt;
    String sourceCardNumber;
    String receiptImageUrl;
}
