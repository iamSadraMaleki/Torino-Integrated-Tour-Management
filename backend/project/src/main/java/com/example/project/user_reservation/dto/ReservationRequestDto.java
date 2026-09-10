package com.example.project.user_reservation.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class ReservationRequestDto {

    @NotNull(message = "شناسه تور الزامی است")
    private Long tourId;

    @NotNull(message = "حداقل یک صندلی باید انتخاب شود")
    @Size(min = 1, message = "حداقل یک صندلی باید انتخاب شود")
    private Set<Long> seatIds;  // شماره صندلی‌های انتخاب شده

    @NotNull(message = "اطلاعات مسافران الزامی است")
    @Size(min = 1, message = "حداقل یک مسافر باید اضافه شود")
    private List<PassengerDto> passengers;
}