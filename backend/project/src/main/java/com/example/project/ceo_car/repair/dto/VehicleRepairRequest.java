package com.example.project.ceo_car.repair.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * ثبت سرویس/تعمیر خودرو در دفتر تعمیرات
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleRepairRequest {

    @NotNull(message = "خودرو الزامی است")
    private Long vehicleId;

    @NotNull(message = "تاریخ سرویس الزامی است")
    private LocalDate repairDate;

    @NotNull(message = "هزینه الزامی است")
    @DecimalMin(value = "0", message = "هزینه نمی‌تواند منفی باشد")
    private BigDecimal cost;

    @NotNull(message = "نوع سرویس الزامی است")
    private String repairType; // ROUTINE_SERVICE / REPAIR / ACCIDENT / OTHER

    @NotBlank(message = "عنوان (دلیل سرویس) الزامی است")
    @Size(max = 200, message = "عنوان نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد")
    private String title;

    @Size(max = 2000, message = "توضیحات نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد")
    private String description;

    @Size(max = 150, message = "نام تعمیرگاه نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد")
    private String workshopName;
}
