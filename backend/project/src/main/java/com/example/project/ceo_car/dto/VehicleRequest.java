package com.example.project.ceo_car.dto;

import com.example.project.ceo_car.model.VehicleStatus;
import com.example.project.ceo_car.model.VehicleType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Set;

@Data
public class VehicleRequest {

    @NotBlank(message = "نام ماشین الزامی است")
    @Size(min = 2, max = 100, message = "نام ماشین باید بین 2 تا 100 کاراکتر باشد")
    private String name;

    @NotBlank(message = "شرکت سازنده الزامی است")
    @Size(min = 2, max = 100, message = "نام شرکت سازنده باید بین 2 تا 100 کاراکتر باشد")
    private String manufacturer;

    @NotNull(message = "نوع ماشین الزامی است")
    private VehicleType type;

    @NotNull(message = "وضعیت ماشین الزامی است")
    private VehicleStatus status;

    @NotBlank(message = "پلاک ماشین الزامی است")
    @Pattern(regexp = "^\\d{2}[آ-یA-Z]{1}\\d{3}(ایران|Iran)$",  // ✅ اصلاح شده
            message = "فرمت پلاک صحیح نیست (مثال: 12ج345ایران یا 23A456Iran)")
    private String plateNumber;

    @NotBlank(message = "رنگ ماشین الزامی است")
    @Size(min = 2, max = 50, message = "رنگ باید بین 2 تا 50 کاراکتر باشد")
    private String color;

    @NotNull(message = "تعداد ردیف الزامی است")
    @Min(value = 1, message = "تعداد ردیف باید حداقل 1 باشد")
    @Max(value = 20, message = "تعداد ردیف نمی‌تواند بیش از 20 باشد")
    private Integer rowCount;

    @NotNull(message = "تعداد صندلی الزامی است")
    @Min(value = 4, message = "تعداد صندلی باید حداقل 4 باشد")
    @Max(value = 60, message = "تعداد صندلی نمی‌تواند بیش از 60 باشد")
    private Integer seatCount;

    private Long currentDriverId;

    @Min(value = 1990, message = "سال ساخت باید از 1990 به بعد باشد")
    @Max(value = 2030, message = "سال ساخت نمی‌تواند بیش از 2030 باشد")
    private Integer modelYear;

    @Size(max = 500, message = "توضیحات نباید بیشتر از 500 کاراکتر باشد")
    private String description;

    private Set<Long> featureIds;
}
