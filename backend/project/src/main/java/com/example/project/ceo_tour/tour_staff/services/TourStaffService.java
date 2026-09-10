package com.example.project.ceo_tour.tour_staff.services;

import com.example.project.ceo_tour.tour_staff.dto.AssignStaffToTourDTO;
import com.example.project.ceo_tour.tour_staff.dto.StaffTourHistoryResponseDTO;
import com.example.project.ceo_tour.tour_staff.dto.TourStaffResponseDTO;

import java.util.List;

public interface TourStaffService {

    TourStaffResponseDTO assignStaff(AssignStaffToTourDTO request);

    List<TourStaffResponseDTO> getStaffByTour(Long tourId);

    void removeStaff(Long tourId, Long staffId);

    /** تاریخچه سفرهای یک کارمند (تورهایی که در آن‌ها تخصیص داده شده) */
    List<StaffTourHistoryResponseDTO> getToursByStaff(String username, Long staffId);
}