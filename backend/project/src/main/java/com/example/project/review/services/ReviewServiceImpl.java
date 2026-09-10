package com.example.project.review.services;

import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.ceo_tour.tour.repository.TourRepository;
import com.example.project.review.dto.ReviewRequest;
import com.example.project.review.dto.TourReviewDto;
import com.example.project.review.model.TourReview;
import com.example.project.review.repository.TourReviewRepository;
import com.example.project.user_reservation.repository.ReservationRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final TourReviewRepository tourReviewRepository;
    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;

    @Override
    @Transactional
    public TourReviewDto create(Long userId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("کاربر یافت نشد"));
        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new RuntimeException("تور یافت نشد"));

        // فقط مسافری که این تور را رزرو تأییدشده و سفرش تمام شده می‌تواند نظر دهد
        boolean traveled = reservationRepository.hasConfirmedPastTravel(
                userId, tour.getId(), LocalDate.now());
        if (!traveled) {
            throw new RuntimeException("شما مسافر تأییدشده این تور نیستید یا سفر هنوز آغاز نشده است");
        }

        // هر کاربر فقط یک بار برای هر تور
        if (tourReviewRepository.existsByUserIdAndTourId(userId, tour.getId())) {
            throw new RuntimeException("شما قبلاً برای این تور نظر ثبت کرده‌اید");
        }

        String comment = request.getComment() != null ? request.getComment().trim() : "";
        TourReview review = TourReview.builder()
                .user(user)
                .tour(tour)
                .rating(request.getRating())
                .comment(comment)
                .build();
        review = tourReviewRepository.save(review);
        return toDto(review);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourReviewDto> getMyReviews(Long userId) {
        return tourReviewRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourReviewDto> getCeoReviews(String ceoUsername) {
        return tourReviewRepository.findByTourCreatedByUsername(ceoUsername)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourReviewDto> getAllReviews() {
        return tourReviewRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(Long reviewId) {
        if (!tourReviewRepository.existsById(reviewId)) {
            throw new RuntimeException("نظر یافت نشد");
        }
        tourReviewRepository.deleteById(reviewId);
    }

    private TourReviewDto toDto(TourReview review) {
        Tour tour = review.getTour();
        String tourName = "";
        String tourCode = "";
        if (tour.getBaseTour() != null) {
            tourName = tour.getBaseTour().getTourName() != null ? tour.getBaseTour().getTourName() : "";
            tourCode = tour.getBaseTour().getTourCode() != null ? tour.getBaseTour().getTourCode() : "";
        }

        return TourReviewDto.builder()
                .id(review.getId())
                .tourId(tour.getId())
                .tourName(tourName)
                .tourCode(tourCode)
                .rating(review.getRating())
                .comment(review.getComment())
                .userUsername(review.getUser() != null ? review.getUser().getUsername() : "")
                .userMobile(review.getUser() != null ? review.getUser().getMobile() : "")
                .agencyUsername(tour.getCreatedBy() != null ? tour.getCreatedBy().getUsername() : "")
                .createdAt(review.getCreatedAt())
                .build();
    }
}
