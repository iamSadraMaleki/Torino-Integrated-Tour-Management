package com.example.project.finance.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementRequestCreateRequest {

    @NotNull(message = "مبلغ تسویه الزامی است")
    @DecimalMin(value = "1000", message = "حداقل مبلغ تسویه ۱٬۰۰۰ تومان است")
    private BigDecimal amount;
}
