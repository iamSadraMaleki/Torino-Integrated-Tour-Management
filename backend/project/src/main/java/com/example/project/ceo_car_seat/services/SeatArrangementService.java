package com.example.project.ceo_car_seat.services;


import com.example.project.ceo_car_seat.dto.SeatArrangementDto;
import com.example.project.ceo_car_seat.dto.SeatArrangementRequest;

import java.util.List;

public interface SeatArrangementService {

    SeatArrangementDto createArrangement(String username, SeatArrangementRequest request);

    SeatArrangementDto updateArrangement(String username, Long arrangementId, SeatArrangementRequest request);

    void deleteArrangement(String username, Long arrangementId);

    SeatArrangementDto getArrangement(String username, Long arrangementId);

    List<SeatArrangementDto> getAllArrangements(String username);

    SeatArrangementDto getDefaultArrangement(String username);

    SeatArrangementDto setDefaultArrangement(String username, Long arrangementId);
}
