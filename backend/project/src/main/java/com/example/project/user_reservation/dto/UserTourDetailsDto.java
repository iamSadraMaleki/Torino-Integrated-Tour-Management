package com.example.project.user_reservation.dto;

import com.example.project.ceo_car.dto.VehicleDto;
import com.example.project.ceo_hotel.dto.HotelDto;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
public class UserTourDetailsDto {
    private Long id;
    private String baseTourName;
    private String baseTourCode;
    private String description;
    private LocalDate departureDate;
    private LocalDate returnDate;
    private BigDecimal price;
    /** قیمت تخفیف‌خورده تور ویژه (در صورت فعال بودن) */
    private BigDecimal discountedPrice;
    /** درصد تخفیف ویژه فعال */
    private Integer discountPercent;
    private Integer totalCapacity;
    private Integer availableCapacity;
    private String agencyName;
    private List<UserTourScheduleItemDto> schedule;
    private List<HotelDto> hotels;
    private List<TourFoodDto> foods;
    private List<VehicleDto> vehicles;
    private List<StaffMemberDto> staffs;
}
