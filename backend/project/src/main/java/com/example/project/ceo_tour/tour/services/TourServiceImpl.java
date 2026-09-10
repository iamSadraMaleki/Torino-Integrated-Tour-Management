package com.example.project.ceo_tour.tour.services;

import com.example.project.ceo_tour.basetour.Repository.BaseTourRepository;
import com.example.project.ceo_tour.basetour.Repository.BaseTourOriginStationRepository;
import com.example.project.ceo_tour.basetour.Repository.BaseTourDestinationStationRepository;
import com.example.project.ceo_tour.basetour.Repository.BaseTourProgramStationRepository;
import com.example.project.ceo_tour.basetour.model.BaseTour;
import com.example.project.ceo_tour.tour.dto.*;
import com.example.project.ceo_tour.tour.model.*;
import com.example.project.ceo_tour.tour.repository.*;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.example.project.ceo_tour.station.Repository.StationRepository;
import com.example.project.ceo_tour.station.model.Station;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TourServiceImpl implements TourService {

    private final TourRepository tourRepository;
    private final TourOriginStationRepository tourOriginRepo;
    private final TourDestinationStationRepository tourDestinationRepo;
    private final TourProgramStationRepository tourProgramRepo;

    private final BaseTourRepository baseTourRepository;
    private final BaseTourOriginStationRepository baseOriginRepo;
    private final BaseTourDestinationStationRepository baseDestinationRepo;
    private final BaseTourProgramStationRepository baseProgramRepo;
    private final StationRepository stationRepository;

    private final UserRepository userRepository;

    /* ===================== Helpers ===================== */

    private User requireUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Tour requireMyTour(String username, Long tourId) {
        return tourRepository.findByIdAndCreatedByUsername(tourId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));
    }

    private BaseTour requireMyBaseTour(String username, Long baseTourId) {
        return baseTourRepository.findByIdAndCreatedByUsername(baseTourId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Base tour not found"));
    }

    /* ===================== CRUD ===================== */

    @Override
    @Transactional
    public TourDto create(String username, TourCreateRequest request) {
        User user = requireUser(username);
        BaseTour baseTour = requireMyBaseTour(username, request.getBaseTourId());

        // اعتبارسنجی تاریخ
        if (request.getReturnDate().isBefore(request.getDepartureDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Return date must be after departure date");
        }

        // ساخت تور
        Tour tour = Tour.builder()
                .baseTour(baseTour)
                .createdBy(user)
                .departureDate(request.getDepartureDate())
                .returnDate(request.getReturnDate())
                .price(request.getPrice())
                .capacity(request.getCapacity())
                .description(request.getDescription())
                .build();

        tour = tourRepository.save(tour);

        // کپی کردن ایستگاه‌های مبدا از BaseTour
        copyOriginStationsFromBaseTour(baseTour, tour);

        // کپی کردن ایستگاه‌های مقصد از BaseTour
        copyDestinationStationsFromBaseTour(baseTour, tour);

        // کپی کردن برنامه تور از BaseTour
        copyProgramStationsFromBaseTour(baseTour, tour);

        return TourDto.fromEntity(tour);
    }

    private void copyOriginStationsFromBaseTour(BaseTour baseTour, Tour tour) {
        var baseOrigins = baseOriginRepo.findAllByBaseTourIdOrderByOrderNoAsc(baseTour.getId());
        baseOrigins.forEach(baseOrigin -> {
            tourOriginRepo.save(TourOriginStation.builder()
                    .tour(tour)
                    .station(baseOrigin.getStation())
                    .orderNo(baseOrigin.getOrderNo())
                    .minutesToNext(baseOrigin.getMinutesToNext())
                    .isActive(true) // همه فعال
                    .build());
        });
    }

    private void copyDestinationStationsFromBaseTour(BaseTour baseTour, Tour tour) {
        var baseDestinations = baseDestinationRepo.findAllByBaseTourIdOrderByOrderNoAsc(baseTour.getId());
        baseDestinations.forEach(baseDest -> {
            tourDestinationRepo.save(TourDestinationStation.builder()
                    .tour(tour)
                    .station(baseDest.getStation())
                    .orderNo(baseDest.getOrderNo())
                    .minutesToNext(baseDest.getMinutesToNext())
                    .isActive(true)
                    .build());
        });
    }

    private void copyProgramStationsFromBaseTour(BaseTour baseTour, Tour tour) {
        var basePrograms = baseProgramRepo.findAllByBaseTourIdOrderByOrderNoAsc(baseTour.getId());
        basePrograms.forEach(baseProg -> {
            tourProgramRepo.save(TourProgramStation.builder()
                    .tour(tour)
                    .station(baseProg.getStation())
                    .orderNo(baseProg.getOrderNo())
                    .minutesToNext(baseProg.getMinutesToNext())
                    .isActive(true)
                    .build());
        });
    }

    @Override
    @Transactional
    public TourDto update(String username, Long tourId, TourUpdateRequest request) {
        Tour tour = requireMyTour(username, tourId);

        if (request.getDepartureDate() != null) {
            tour.setDepartureDate(request.getDepartureDate());
        }

        if (request.getReturnDate() != null) {
            tour.setReturnDate(request.getReturnDate());
        }

        // اعتبارسنجی تاریخ
        if (tour.getReturnDate().isBefore(tour.getDepartureDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Return date must be after departure date");
        }

        if (request.getPrice() != null) {
            tour.setPrice(request.getPrice());
        }

        if (request.getCapacity() != null) {
            tour.setCapacity(request.getCapacity());
        }

        if (request.getDescription() != null) {
            tour.setDescription(request.getDescription());
        }

        return TourDto.fromEntity(tourRepository.save(tour));
    }

    @Override
    @Transactional
    public void delete(String username, Long tourId) {
        Tour tour = requireMyTour(username, tourId);

        // حذف ایستگاه‌ها
        tourOriginRepo.deleteAllByTourId(tourId);
        tourDestinationRepo.deleteAllByTourId(tourId);
        tourProgramRepo.deleteAllByTourId(tourId);

        // حذف تور
        tourRepository.delete(tour);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourDto> getMyTours(String username) {
        return tourRepository.findAllByCreatedByUsernameOrderByDepartureDateDesc(username)
                .stream()
                .map(TourDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TourDetailsDto getDetails(String username, Long tourId) {
        Tour tour = requireMyTour(username, tourId);

        return TourDetailsDto.builder()
                .tour(TourDto.fromEntity(tour))
                .originStations(
                        tourOriginRepo.findAllByTourIdOrderByOrderNoAsc(tourId)
                                .stream()
                                .map(o -> TourStationItemDto.builder()
                                        .id(o.getId())
                                        .stationId(o.getStation().getId())
                                        .stationName(o.getStation().getStationName())
                                        .orderNo(o.getOrderNo())
                                        .minutesToNext(o.getMinutesToNext())
                                        .isActive(o.getIsActive())
                                        .build())
                                .toList()
                )
                .destinationStations(
                        tourDestinationRepo.findAllByTourIdOrderByOrderNoAsc(tourId)
                                .stream()
                                .map(d -> TourStationItemDto.builder()
                                        .id(d.getId())
                                        .stationId(d.getStation().getId())
                                        .stationName(d.getStation().getStationName())
                                        .orderNo(d.getOrderNo())
                                        .minutesToNext(d.getMinutesToNext())
                                        .isActive(d.getIsActive())
                                        .build())
                                .toList()
                )
                .programStations(
                        tourProgramRepo.findAllByTourIdOrderByOrderNoAsc(tourId)
                                .stream()
                                .map(p -> TourStationItemDto.builder()
                                        .id(p.getId())
                                        .stationId(p.getStation().getId())
                                        .stationName(p.getStation().getStationName())
                                        .orderNo(p.getOrderNo())
                                        .minutesToNext(p.getMinutesToNext())
                                        .isActive(p.getIsActive())
                                        .build())
                                .toList()
                )
                .build();
    }

    /* ===================== Toggle Stations ===================== */

    @Override
    @Transactional
    public void toggleOriginStation(String username, Long tourId, TourStationToggleRequest request) {

        requireMyTour(username, tourId);

        TourOriginStation station = tourOriginRepo
                .findByIdAndTourCreatedByUsername(request.getStationItemId(), username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Origin station not found"));

        // =========================
        // Deactivate
        // =========================
        if (!request.getIsActive()) {

            int removedOrder = station.getOrderNo();

            if (removedOrder >= 0) {
                tourOriginRepo.findAllByTourIdAndIsActiveTrueOrderByOrderNoAsc(tourId)
                        .stream()
                        .filter(s -> s.getOrderNo() > removedOrder)
                        .forEach(s -> {
                            s.setOrderNo(s.getOrderNo() - 1);
                            tourOriginRepo.save(s);
                        });
            }

            station.setIsActive(false);
            station.setOrderNo(-1); // 👈 به جای null
            tourOriginRepo.save(station);
            return;
        }

        // =========================
        // Reactivate
        // =========================
        if (request.getOrderNo() == null || request.getOrderNo() < 0)
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Valid order number is required when activating");

        int newOrder = request.getOrderNo();

        tourOriginRepo.findAllByTourIdAndIsActiveTrueOrderByOrderNoAsc(tourId)
                .stream()
                .filter(s -> s.getOrderNo() >= newOrder)
                .forEach(s -> {
                    s.setOrderNo(s.getOrderNo() + 1);
                    tourOriginRepo.save(s);
                });

        station.setOrderNo(newOrder);
        station.setIsActive(true);
        tourOriginRepo.save(station);
    }


    @Override
    @Transactional
    public void toggleDestinationStation(String username, Long tourId, TourStationToggleRequest request) {

        requireMyTour(username, tourId);

        TourDestinationStation station = tourDestinationRepo
                .findByIdAndTourCreatedByUsername(request.getStationItemId(), username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Destination station not found"));

        if (!request.getIsActive()) {

            int removedOrder = station.getOrderNo();

            if (removedOrder >= 0) {
                tourDestinationRepo.findAllByTourIdAndIsActiveTrueOrderByOrderNoAsc(tourId)
                        .stream()
                        .filter(s -> s.getOrderNo() > removedOrder)
                        .forEach(s -> {
                            s.setOrderNo(s.getOrderNo() - 1);
                            tourDestinationRepo.save(s);
                        });
            }

            station.setIsActive(false);
            station.setOrderNo(-1);
            tourDestinationRepo.save(station);
            return;
        }

        if (request.getOrderNo() == null || request.getOrderNo() < 0)
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Valid order number is required when activating");

        int newOrder = request.getOrderNo();

        tourDestinationRepo.findAllByTourIdAndIsActiveTrueOrderByOrderNoAsc(tourId)
                .stream()
                .filter(s -> s.getOrderNo() >= newOrder)
                .forEach(s -> {
                    s.setOrderNo(s.getOrderNo() + 1);
                    tourDestinationRepo.save(s);
                });

        station.setOrderNo(newOrder);
        station.setIsActive(true);
        tourDestinationRepo.save(station);
    }


    @Override
    @Transactional
    public void toggleProgramStation(String username, Long tourId, TourStationToggleRequest request) {

        requireMyTour(username, tourId);

        TourProgramStation station = tourProgramRepo
                .findByIdAndTourCreatedByUsername(request.getStationItemId(), username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Program station not found"));

        if (!request.getIsActive()) {

            int removedOrder = station.getOrderNo();

            if (removedOrder >= 0) {
                tourProgramRepo.findAllByTourIdAndIsActiveTrueOrderByOrderNoAsc(tourId)
                        .stream()
                        .filter(s -> s.getOrderNo() > removedOrder)
                        .forEach(s -> {
                            s.setOrderNo(s.getOrderNo() - 1);
                            tourProgramRepo.save(s);
                        });
            }

            station.setIsActive(false);
            station.setOrderNo(-1);
            tourProgramRepo.save(station);
            return;
        }

        if (request.getOrderNo() == null || request.getOrderNo() < 0)
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Valid order number is required when activating");

        int newOrder = request.getOrderNo();

        tourProgramRepo.findAllByTourIdAndIsActiveTrueOrderByOrderNoAsc(tourId)
                .stream()
                .filter(s -> s.getOrderNo() >= newOrder)
                .forEach(s -> {
                    s.setOrderNo(s.getOrderNo() + 1);
                    tourProgramRepo.save(s);
                });

        station.setOrderNo(newOrder);
        station.setIsActive(true);
        tourProgramRepo.save(station);
    }


    @Override
    @Transactional
    public void addOriginStation(String username, Long tourId, TourStationItemDto request) {

        Tour tour = requireMyTour(username, tourId);

        Station station = stationRepository.findByIdAndCreatedByUsername(
                        request.getStationId(), username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid station"));

        List<TourOriginStation> stations =
                tourOriginRepo.findAllByTourIdOrderByOrderNoAsc(tourId);

        int newOrder = request.getOrderNo();

        // شیفت دادن order_no ها
        stations.stream()
                .filter(s -> s.getOrderNo() >= newOrder)
                .forEach(s -> {
                    s.setOrderNo(s.getOrderNo() + 1);
                    tourOriginRepo.save(s);
                });

        // ثبت ایستگاه جدید
        tourOriginRepo.save(TourOriginStation.builder()
                .tour(tour)
                .station(station)
                .orderNo(newOrder)
                .minutesToNext(request.getMinutesToNext())
                .isActive(true)
                .build());
    }

    @Override
    @Transactional
    public void addDestinationStation(String username, Long tourId, TourStationItemDto request) {

        Tour tour = requireMyTour(username, tourId);

        Station station = stationRepository.findByIdAndCreatedByUsername(
                        request.getStationId(), username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid station"));

        List<TourDestinationStation> stations =
                tourDestinationRepo.findAllByTourIdOrderByOrderNoAsc(tourId);

        int newOrder = request.getOrderNo();

        stations.stream()
                .filter(s -> s.getOrderNo() >= newOrder)
                .forEach(s -> {
                    s.setOrderNo(s.getOrderNo() + 1);
                    tourDestinationRepo.save(s);
                });

        tourDestinationRepo.save(TourDestinationStation.builder()
                .tour(tour)
                .station(station)
                .orderNo(newOrder)
                .minutesToNext(request.getMinutesToNext())
                .isActive(true)
                .build());
    }

    @Override
    @Transactional
    public void addProgramStation(String username, Long tourId, TourStationItemDto request) {

        Tour tour = requireMyTour(username, tourId);

        Station station = stationRepository.findByIdAndCreatedByUsername(
                        request.getStationId(), username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid station"));

        List<TourProgramStation> stations =
                tourProgramRepo.findAllByTourIdOrderByOrderNoAsc(tourId);

        int newOrder = request.getOrderNo();

        stations.stream()
                .filter(s -> s.getOrderNo() >= newOrder)
                .forEach(s -> {
                    s.setOrderNo(s.getOrderNo() + 1);
                    tourProgramRepo.save(s);
                });

        tourProgramRepo.save(TourProgramStation.builder()
                .tour(tour)
                .station(station)
                .orderNo(newOrder)
                .minutesToNext(request.getMinutesToNext())
                .isActive(true)
                .build());
    }
    @Override
    @Transactional
    public TourDto changeStatus(String username, Long tourId, TourStatus newStatus) {
        Tour tour = requireMyTour(username, tourId);

        // اعتبارسنجی منطقی (اختیاری)
        if (tour.getStatus() == TourStatus.EXPIRED && newStatus == TourStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot activate an expired tour");
        }

        if (tour.getStatus() == TourStatus.SOLD_OUT && newStatus == TourStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot activate a sold-out tour");
        }

        tour.setStatus(newStatus);
        Tour saved = tourRepository.save(tour);

        return TourDto.fromEntity(saved);
    }

    // همچنین متد کمکی برای بررسی خودکار وضعیت (بعداً برای فروش استفاده می‌شود)
    private void autoUpdateStatusBasedOnSales(Tour tour) {
        // TODO: بعداً وقتی فروش پیاده شد، این منطق رو می‌نویسیم
        // اگه ظرفیت پر شد -> SOLD_OUT
        // اگه تاریخ برگشت گذشت -> EXPIRED
    }
    @Override
    @Transactional(readOnly = true)
    public List<TourDto> getMyToursByStatus(String username, TourStatus status) {
        return tourRepository.findAllByCreatedByUsernameAndStatusOrderByDepartureDateDesc(username, status)
                .stream()
                .map(TourDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourDto> getAllTours() {
        return tourRepository.findAllByOrderByDepartureDateDesc().stream()
                .map(TourDto::fromEntity)
                .toList();
    }

}
