package com.example.project.ceo_tour.tour_staff.services;

import com.example.project.ceo_personel.model.StaffMember;
import com.example.project.ceo_personel.repository.StaffMemberRepository;
import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.ceo_tour.tour.repository.TourRepository;
import com.example.project.ceo_tour.tour_staff.dto.*;
import com.example.project.ceo_tour.tour_staff.model.TourStaffMember;
import com.example.project.ceo_tour.tour_staff.repository.TourStaffMemberRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional
public class TourStaffServiceImpl implements TourStaffService {

    private final TourRepository tourRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final TourStaffMemberRepository tourStaffMemberRepository;
    private final UserRepository userRepository;

    @Override
    public TourStaffResponseDTO assignStaff(AssignStaffToTourDTO request) {

        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        StaffMember staff = staffMemberRepository.findById(request.getStaffMemberId())
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        // جلوگیری از ثبت تکراری
        tourStaffMemberRepository
                .findByTour_IdAndStaffMember_Id(
                        request.getTourId(),
                        request.getStaffMemberId())
                .ifPresent(t -> {
                    throw new RuntimeException("Staff already assigned to this tour");
                });

        TourStaffMember entity = TourStaffMember.builder()
                .tour(tour)
                .staffMember(staff)
                .paymentAmount(request.getPaymentAmount())
                .createdAt(LocalDateTime.now())
                .build();

        tourStaffMemberRepository.save(entity);

        return mapToDTO(entity);
    }

    @Override
    public List<TourStaffResponseDTO> getStaffByTour(Long tourId) {

        return tourStaffMemberRepository
                .findAllByTour_Id(tourId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public void removeStaff(Long tourId, Long staffId) {
        tourStaffMemberRepository
                .deleteByTour_IdAndStaffMember_Id(tourId, staffId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffTourHistoryResponseDTO> getToursByStaff(String username, Long staffId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        staffMemberRepository.findByIdAndUserId(staffId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "کارمند مورد نظر پیدا نشد یا متعلق به شما نیست"));

        return tourStaffMemberRepository.findAllByStaffMember_IdOrderByCreatedAtDesc(staffId)
                .stream()
                .map(t -> {
                    String tourName = "";
                    String tourCode = "";
                    if (t.getTour().getBaseTour() != null) {
                        tourName = t.getTour().getBaseTour().getTourName() != null
                                ? t.getTour().getBaseTour().getTourName() : "";
                        tourCode = t.getTour().getBaseTour().getTourCode() != null
                                ? t.getTour().getBaseTour().getTourCode() : "";
                    }
                    return StaffTourHistoryResponseDTO.builder()
                            .id(t.getId())
                            .tourId(t.getTour().getId())
                            .tourName(tourName)
                            .tourCode(tourCode)
                            .departureDate(t.getTour().getDepartureDate())
                            .returnDate(t.getTour().getReturnDate())
                            .paymentAmount(t.getPaymentAmount())
                            .assignedAt(t.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private TourStaffResponseDTO mapToDTO(TourStaffMember entity) {

        return TourStaffResponseDTO.builder()
                .id(entity.getId())
                .tourId(entity.getTour().getId())
                .staffMemberId(entity.getStaffMember().getId())
                .fullName(entity.getStaffMember().getFullName())
                .paymentAmount(entity.getPaymentAmount())
                .build();
    }
}
