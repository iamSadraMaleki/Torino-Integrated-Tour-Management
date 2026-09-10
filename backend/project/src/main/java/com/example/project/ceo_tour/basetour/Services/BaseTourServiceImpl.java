package com.example.project.ceo_tour.basetour.Services;


import com.example.project.ceo_tour.basetour.Repository.*;
import com.example.project.ceo_tour.basetour.dto.*;
import com.example.project.ceo_tour.basetour.model.*;
import com.example.project.ceo_tour.station.Repository.*;
import com.example.project.ceo_tour.station.model.Station;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BaseTourServiceImpl implements BaseTourService {

    private final BaseTourRepository baseTourRepository;
    private final BaseTourOriginStationRepository originRepo;
    private final BaseTourDestinationStationRepository destinationRepo;
    private final BaseTourProgramStationRepository programRepo;

    private final StationRepository stationRepository;
    private final CityRepository cityRepository;
    private final UserRepository userRepository;

    /* ===================== helpers ===================== */

    private User requireUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private BaseTour requireMyTour(String username, Long tourId) {
        return baseTourRepository.findByIdAndCreatedByUsername(tourId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Base tour not found"));
    }

    private Station requireMyStation(String username, Long stationId) {
        return stationRepository.findByIdAndCreatedByUsername(stationId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid station"));
    }

    /* ===================== BaseTour ===================== */

    @Override
    @Transactional
    public BaseTourDto create(String username, BaseTourCreateRequest request) {

        if (baseTourRepository.existsByCreatedByUsernameAndTourCodeIgnoreCase(username, request.getTourCode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tour code already exists");
        }

        User ceo = requireUser(username);

        var originCity = cityRepository.findById(request.getOriginCityId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Origin city not found"));

        var destinationCity = cityRepository.findById(request.getDestinationCityId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Destination city not found"));

        BaseTour tour = BaseTour.builder()
                .tourName(request.getTourName().trim())
                .tourCode(request.getTourCode().trim())
                .createdBy(ceo)
                .originCity(originCity)
                .destinationCity(destinationCity)
                .build();

        return BaseTourDto.fromEntity(baseTourRepository.save(tour));
    }

    @Override
    @Transactional
    public BaseTourDto update(String username, Long tourId, BaseTourUpdateRequest request) {
        BaseTour tour = requireMyTour(username, tourId);

        if (request.getTourName() != null) {
            tour.setTourName(request.getTourName().trim());
        }
        if (request.getTourCode() != null) {
            tour.setTourCode(request.getTourCode().trim());
        }
        if (request.getOriginCityId() != null) {
            tour.setOriginCity(
                    cityRepository.findById(request.getOriginCityId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Origin city not found"))
            );
        }
        if (request.getDestinationCityId() != null) {
            tour.setDestinationCity(
                    cityRepository.findById(request.getDestinationCityId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Destination city not found"))
            );
        }

        return BaseTourDto.fromEntity(baseTourRepository.save(tour));
    }

    @Override
    @Transactional
    public void delete(String username, Long tourId) {
        BaseTour tour = requireMyTour(username, tourId);

        originRepo.deleteAllByBaseTourId(tourId);
        destinationRepo.deleteAllByBaseTourId(tourId);
        programRepo.deleteAllByBaseTourId(tourId);

        baseTourRepository.delete(tour);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BaseTourDto> getMyTours(String username) {
        return baseTourRepository.findAllByCreatedByUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(BaseTourDto::fromEntity)
                .toList();
    }

    /* ===================== Details ===================== */

    @Override
    @Transactional(readOnly = true)
    public BaseTourDetailsDto getDetails(String username, Long tourId) {
        BaseTour tour = requireMyTour(username, tourId);

        return BaseTourDetailsDto.builder()
                .tour(BaseTourDto.fromEntity(tour))
                .originStations(
                        originRepo.findAllByBaseTourIdOrderByOrderNoAsc(tourId)
                                .stream()
                                .map(o -> BaseTourStationItemDto.builder()
                                        .id(o.getId())
                                        .stationId(o.getStation().getId())
                                        .stationName(o.getStation().getStationName())
                                        .orderNo(o.getOrderNo())
                                        .minutesToNext(o.getMinutesToNext())
                                        .build())
                                .toList()
                )
                .destinationStations(
                        destinationRepo.findAllByBaseTourIdOrderByOrderNoAsc(tourId)
                                .stream()
                                .map(d -> BaseTourStationItemDto.builder()
                                        .id(d.getId())
                                        .stationId(d.getStation().getId())
                                        .stationName(d.getStation().getStationName())
                                        .orderNo(d.getOrderNo())
                                        .minutesToNext(d.getMinutesToNext())
                                        .build())
                                .toList()
                )
                .programStations(
                        programRepo.findAllByBaseTourIdOrderByOrderNoAsc(tourId)
                                .stream()
                                .map(p -> BaseTourStationItemDto.builder()
                                        .id(p.getId())
                                        .stationId(p.getStation().getId())
                                        .stationName(p.getStation().getStationName())
                                        .orderNo(p.getOrderNo())
                                        .minutesToNext(p.getMinutesToNext())
                                        .build())
                                .toList()
                )
                .build();
    }

    /* ===================== Upsert Stops ===================== */

    @Override
    @Transactional
    public void upsertOriginStations(String username, Long tourId, TourStationsUpsertRequest request) {
        BaseTour tour = requireMyTour(username, tourId);
        originRepo.deleteAllByBaseTourId(tourId);

        request.getItems().forEach(item -> {
            Station station = requireMyStation(username, item.getStationId());

            originRepo.save(BaseTourOriginStation.builder()
                    .baseTour(tour)
                    .station(station)
                    .orderNo(item.getOrderNo())
                    .minutesToNext(item.getMinutesToNext())
                    .build());
        });
    }

    @Override
    @Transactional
    public void upsertDestinationStations(String username, Long tourId, TourStationsUpsertRequest request) {
        BaseTour tour = requireMyTour(username, tourId);
        destinationRepo.deleteAllByBaseTourId(tourId);

        request.getItems().forEach(item -> {
            Station station = requireMyStation(username, item.getStationId());

            destinationRepo.save(BaseTourDestinationStation.builder()
                    .baseTour(tour)
                    .station(station)
                    .orderNo(item.getOrderNo())
                    .minutesToNext(item.getMinutesToNext())
                    .build());
        });
    }

    @Override
    @Transactional
    public void upsertProgramStations(String username, Long tourId, TourStationsUpsertRequest request) {
        BaseTour tour = requireMyTour(username, tourId);
        programRepo.deleteAllByBaseTourId(tourId);

        request.getItems().forEach(item -> {
            Station station = requireMyStation(username, item.getStationId());

            programRepo.save(BaseTourProgramStation.builder()
                    .baseTour(tour)
                    .station(station)
                    .orderNo(item.getOrderNo())
                    .minutesToNext(item.getMinutesToNext())
                    .build());
        });
    }
}

