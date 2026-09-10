package com.example.project.review.repository;

import com.example.project.review.model.TourReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TourReviewRepository extends JpaRepository<TourReview, Long> {

    /** نظرات تورهای یک آژانس (مدیر آژانس) */
    @Query("SELECT r FROM TourReview r WHERE r.tour.createdBy.username = :username ORDER BY r.createdAt DESC")
    List<TourReview> findByTourCreatedByUsername(@Param("username") String username);

    /** همه نظرات برای مانیتورینگ ادمین */
    @Query("SELECT r FROM TourReview r ORDER BY r.createdAt DESC")
    List<TourReview> findAllOrderByCreatedAtDesc();

    /** نظرات یک کاربر */
    List<TourReview> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserIdAndTourId(Long userId, Long tourId);
}
