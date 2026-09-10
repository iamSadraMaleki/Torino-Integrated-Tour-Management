package com.example.project.review.services;

import com.example.project.review.dto.ReviewRequest;
import com.example.project.review.dto.TourReviewDto;

import java.util.List;

public interface ReviewService {

    TourReviewDto create(Long userId, ReviewRequest request);

    List<TourReviewDto> getMyReviews(Long userId);

    List<TourReviewDto> getCeoReviews(String ceoUsername);

    List<TourReviewDto> getAllReviews();

    void delete(Long reviewId);
}
