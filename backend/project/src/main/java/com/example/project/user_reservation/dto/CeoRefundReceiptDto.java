package com.example.project.user_reservation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CeoRefundReceiptDto {

    @NotNull(message = "شناسه درخواست برگشت وجه الزامی است")
    private Long refundRequestId;

    @NotBlank(message = "تصویر رسید برگشت وجه الزامی است")
    private String receiptImageUrl;
}
