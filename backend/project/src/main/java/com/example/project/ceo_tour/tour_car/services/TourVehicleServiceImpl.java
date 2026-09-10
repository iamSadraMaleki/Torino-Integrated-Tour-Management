package com.example.project.ceo_tour.tour_car.services;

import com.example.project.ceo_car.model.Vehicle;
import com.example.project.ceo_car.repository.VehicleRepository;
import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.ceo_tour.tour.repository.TourRepository;
import com.example.project.ceo_tour.tour_car.dto.AssignVehicleToTourRequest;
import com.example.project.ceo_tour.tour_car.dto.TourVehicleDto;
import com.example.project.ceo_tour.tour_car.dto.TourVehicleMapper;
import com.example.project.ceo_tour.tour_car.dto.VehicleTourHistoryResponseDTO;
import com.example.project.ceo_tour.tour_car.model.TourVehicle;
import com.example.project.ceo_tour.tour_car.repository.TourVehicleRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TourVehicleServiceImpl implements TourVehicleService {

    private final TourVehicleRepository tourVehicleRepository;
    private final TourRepository tourRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final TourVehicleMapper mapper;

    @Override
    @Transactional
    public TourVehicleDto assignVehicle(Long tourId, AssignVehicleToTourRequest request) {

        User user = getCurrentUser();

        log.info("User [{}] assigning vehicle [{}] to tour [{}]",
                user.getUsername(), request.getVehicleId(), tourId);

        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> {
                    log.warn("Tour [{}] not found for user [{}]", tourId, user.getUsername());
                    return new TourNotFoundException("Tour not found");
                });

        Vehicle vehicle = vehicleRepository.findByIdAndUserId(request.getVehicleId(), user.getId())
                .orElseThrow(() -> {
                    log.warn("Vehicle [{}] not found for user [{}]",
                            request.getVehicleId(), user.getUsername());
                    return new VehicleNotFoundException("Vehicle not found");
                });

        if (tourVehicleRepository.existsByTourIdAndVehicleId(tourId, vehicle.getId())) {
            log.warn("Vehicle [{}] already assigned to tour [{}]", vehicle.getId(), tourId);
            throw new DuplicateTourVehicleException("Vehicle already assigned to this tour");
        }

        TourVehicle entity = TourVehicle.builder()
                .tour(tour)
                .vehicle(vehicle)
                .build();

        TourVehicle saved = tourVehicleRepository.save(entity);

        log.info("Vehicle [{}] successfully assigned to tour [{}]", vehicle.getId(), tourId);

        return mapper.toDto(saved);
    }

    @Override
    @Transactional
    public void removeVehicle(Long tourId, Long vehicleId) {

        User user = getCurrentUser();

        log.info("User [{}] removing vehicle [{}] from tour [{}]",
                user.getUsername(), vehicleId, tourId);

        if (!tourVehicleRepository.existsByTourIdAndVehicleId(tourId, vehicleId)) {
            log.warn("Vehicle [{}] not assigned to tour [{}]", vehicleId, tourId);
            throw new TourVehicleNotFoundException("Vehicle not assigned to this tour");
        }

        tourVehicleRepository.deleteByTourIdAndVehicleId(tourId, vehicleId);

        log.info("Vehicle [{}] removed from tour [{}]", vehicleId, tourId);
    }

    @Override
    @Transactional
    public List<TourVehicleDto> getTourVehicles(Long tourId) {

        User user = getCurrentUser();

        log.debug("Fetching vehicles for tour [{}] by user [{}]",
                tourId, user.getUsername());

        return tourVehicleRepository.findAllByTourId(tourId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public List<VehicleTourHistoryResponseDTO> getToursByVehicle(String username, Long vehicleId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "کاربر یافت نشد"));

        // بررسی مالکیت خودرو
        vehicleRepository.findByIdAndUserId(vehicleId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "خودرو مورد نظر پیدا نشد یا متعلق به شما نیست"));

        log.info("User [{}] fetching tour history for vehicle [{}]", username, vehicleId);

        return tourVehicleRepository.findAllByVehicleIdAndUsername(vehicleId, username)
                .stream()
                .map(tv -> {
                    String tourName = "";
                    String tourCode = "";
                    if (tv.getTour().getBaseTour() != null) {
                        tourName = tv.getTour().getBaseTour().getTourName() != null
                                ? tv.getTour().getBaseTour().getTourName() : "";
                        tourCode = tv.getTour().getBaseTour().getTourCode() != null
                                ? tv.getTour().getBaseTour().getTourCode() : "";
                    }
                    return VehicleTourHistoryResponseDTO.builder()
                            .id(tv.getId())
                            .tourId(tv.getTour().getId())
                            .tourName(tourName)
                            .tourCode(tourCode)
                            .departureDate(tv.getTour().getDepartureDate())
                            .returnDate(tv.getTour().getReturnDate())
                            .assignedAt(tv.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("Authenticated user [{}] not found", username);
                    return new UsernameNotFoundException("User not found");
                });
    }
}