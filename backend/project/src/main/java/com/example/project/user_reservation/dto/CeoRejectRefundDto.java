package com.example.project.user_reservation.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CeoRejectRefundDto {

    @NotNull(message = "شناسه درخواست برگشت وجه الزامی است")
    private Long refundRequestId;

    // دلیل رد اختیاری شد تا دکمه رد در همه شرایط کار کند
    @Size(max = 500, message = "دلیل رد حداکثر 500 کاراکتر باشد")
    private String rejectionReason;
}
