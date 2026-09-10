package com.example.project.ceo_tour.tour.repository;

import com.example.project.ceo_tour.tour.model.TourRealSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourRealScheduleRepository
        extends JpaRepository<TourRealSchedule, Long> {

    // گرفتن همه ساعت‌های یک تور مرتب‌شده
    List<TourRealSchedule>
    findAllByTour_IdOrderByOrderIndexAsc(Long tourId);

    // حذف همه ساعت‌های یک تور
    void deleteByTour_Id(Long tourId);
}