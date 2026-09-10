package com.example.project.user_reservation.services;



import com.example.project.user_reservation.dto.SeatStatusDto;
import com.example.project.user_reservation.dto.TourPaymentInfoDto;
import com.example.project.user_reservation.dto.UserTourDetailsDto;
import com.example.project.user_reservation.dto.UserTourDto;

import java.util.List;

public interface UserTourService {

    List<UserTourDto> getAllAvailableTours();

    UserTourDetailsDto getTourDetails(Long tourId);

    List<SeatStatusDto> getTourSeatsStatus(Long tourId);

    TourPaymentInfoDto getTourPaymentInfo(Long tourId);
}


