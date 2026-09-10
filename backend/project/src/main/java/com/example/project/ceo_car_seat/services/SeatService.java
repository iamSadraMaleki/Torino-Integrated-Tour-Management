package com.example.project.ceo_car_seat.services;

import com.example.project.ceo_car_seat.dto.SeatDto;
import com.example.project.ceo_car_seat.dto.SeatGenerateRequest;
import com.example.project.ceo_car_seat.dto.SeatStatisticsDto;
import com.example.project.ceo_car_seat.dto.SeatUpdateRequest;
import com.example.project.ceo_car_seat.model.SeatType;

import java.util.List;

public interface SeatService {

    List<SeatDto> generateSeats(String username, SeatGenerateRequest request);

    SeatDto updateSeat(String username, Long seatId, SeatUpdateRequest request);

    void deleteSeatsByVehicle(String username, Long vehicleId);

    SeatDto getSeat(String username, Long seatId);

    List<SeatDto> getSeatsByVehicle(String username, Long vehicleId);

    List<SeatDto> getActiveSeatsByVehicle(String username, Long vehicleId);

    List<SeatDto> getSeatsByRow(String username, Long vehicleId, Integer rowNumber);

    SeatStatisticsDto getStatistics(String username, Long vehicleId);

    // 🆕 فیلتر بر اساس وضعیت
    List<SeatDto> getSeatsByStatus(String username, Long vehicleId, Boolean isActive);

    // 🆕 فیلتر بر اساس نوع
    List<SeatDto> getSeatsByType(String username, Long vehicleId, SeatType seatType);

    // 🆕 فیلتر ترکیبی
    List<SeatDto> getSeatsByStatusAndType(String username, Long vehicleId, Boolean isActive, SeatType seatType);

}
