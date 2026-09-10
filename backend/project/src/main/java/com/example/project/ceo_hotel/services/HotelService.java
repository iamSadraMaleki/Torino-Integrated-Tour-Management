package com.example.project.ceo_hotel.services;

import com.example.project.ceo_hotel.dto.HotelDto;
import com.example.project.ceo_hotel.dto.HotelRequest;

import java.util.List;

public interface HotelService {

    HotelDto createHotel(HotelRequest request);

    HotelDto updateHotel(Long id, HotelRequest request);

    void deleteHotel(Long id);

    List<HotelDto> getUserHotels();

    HotelDto getHotelById(Long id);
}
