package com.example.project.ceo_tour.tour_staff.repository;

import com.example.project.ceo_tour.tour_staff.model.TourStaffMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TourStaffMemberRepository
        extends JpaRepository<TourStaffMember, Long> {

    List<TourStaffMember> findAllByTour_Id(Long tourId);

    Optional<TourStaffMember>
    findByTour_IdAndStaffMember_Id(Long tourId, Long staffId);

    void deleteByTour_IdAndStaffMember_Id(Long tourId, Long staffId);

    /** همه تورهای یک کارمند — جدیدترین اول (تاریخچه سفر) */
    List<TourStaffMember> findAllByStaffMember_IdOrderByCreatedAtDesc(Long staffId);
}