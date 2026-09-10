package com.example.project.ceo_policy.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class CancellationPolicyRequest {

    @NotBlank(message = "نام سیاست الزامی است")
    @Size(min = 3, max = 100, message = "نام سیاست باید بین 3 تا 100 کاراکتر باشد")
    private String policyName;

    private String description;

    /** بندهای لغو — هر بند شامل ساعت قبل از حرکت و درصد برگشت */
    @Valid
    @NotEmpty(message = "حداقل یک بند لغو باید تعریف شود")
    private List<CancellationPolicyClauseDto> clauses = new ArrayList<>();

    /** فیلد قدیمی — برای سازگاری (در صورت نبودن clauses استفاده می‌شود) */
    private Integer hoursBeforeDeparture;

    /** فیلد قدیمی — برای سازگاری (در صورت نبودن clauses استفاده می‌شود) */
    private BigDecimal refundPercentage;

    private Boolean isDefault = false;
    private Boolean isActive = true;
}
