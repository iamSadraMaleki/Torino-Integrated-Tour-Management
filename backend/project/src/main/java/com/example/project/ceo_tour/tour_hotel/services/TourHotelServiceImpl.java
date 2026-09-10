package com.example.project.ceo_tour.tour_hotel.services;


import com.example.project.ceo_hotel.model.Hotel;
import com.example.project.ceo_hotel.repository.HotelRepository;
import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.ceo_tour.tour.repository.TourRepository;
import com.example.project.ceo_tour.tour_hotel.dto.TourHotelDto;
import com.example.project.ceo_tour.tour_hotel.dto.TourHotelMapper;
import com.example.project.ceo_tour.tour_hotel.dto.TourHotelRequest;
import com.example.project.ceo_tour.tour_hotel.model.TourHotel;
import com.example.project.ceo_tour.tour_hotel.repository.TourHotelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourHotelServiceImpl implements TourHotelService {

    private final TourHotelRepository tourHotelRepository;
    private final TourRepository tourRepository;
    private final HotelRepository hotelRepository;
    private final TourHotelMapper tourHotelMapper;

    private Tour findTourById(Long tourId) {
        return tourRepository.findById(tourId)
                .orElseThrow(() -> {
                    log.warn("Tour not found with id [{}]", tourId);
                    return new TourHotelNotFoundException("Tour not found with id: " + tourId);
                });
    }

    private Hotel findHotelById(Long hotelId) {
        return hotelRepository.findById(hotelId)
                .orElseThrow(() -> {
                    log.warn("Hotel not found with id [{}]", hotelId);
                    return new TourHotelNotFoundException("Hotel not found with id: " + hotelId);
                });
    }

    @Override
    @Transactional
    public TourHotelDto addHotelToTour(TourHotelRequest request) {
        log.info("Adding hotel [{}] to tour [{}]", request.getBaseHotelId(), request.getTourId());

        if (tourHotelRepository.existsByTourIdAndBaseHotelId(request.getTourId(), request.getBaseHotelId())) {
            log.warn("Hotel [{}] is already assigned to tour [{}]", request.getBaseHotelId(), request.getTourId());
            throw new TourHotelAlreadyExistsException(
                    "Hotel is already assigned to this tour"
            );
        }

        Tour tour = findTourById(request.getTourId());
        Hotel hotel = findHotelById(request.getBaseHotelId());

        TourHotel tourHotel = TourHotel.builder()
                .tour(tour)
                .baseHotel(hotel)
                .nightCount(request.getNightCount())
                .build();

        TourHotel saved = tourHotelRepository.save(tourHotel);
        log.info("Hotel [{}] successfully added to tour [{}] with id [{}]",
                hotel.getName(), tour.getId(), saved.getId());

        return tourHotelMapper.toDto(saved);
    }

    @Override
    @Transactional
    public TourHotelDto updateTourHotel(Long id, TourHotelRequest request) {
        log.info("Updating TourHotel id [{}]", id);

        TourHotel tourHotel = tourHotelRepository.findByIdAndTourId(id, request.getTourId())
                .orElseThrow(() -> {
                    log.warn("TourHotel id [{}] not found for tour [{}]", id, request.getTourId());
                    return new TourHotelNotFoundException("TourHotel not found with id: " + id);
                });

        Hotel hotel = findHotelById(request.getBaseHotelId());

        tourHotel.setBaseHotel(hotel);
        tourHotel.setNightCount(request.getNightCount());

        TourHotel updated = tourHotelRepository.save(tourHotel);
        log.info("TourHotel id [{}] updated successfully", updated.getId());

        return tourHotelMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void removeHotelFromTour(Long id) {
        log.info("Removing TourHotel id [{}]", id);

        TourHotel tourHotel = tourHotelRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("TourHotel id [{}] not found during removal", id);
                    return new TourHotelNotFoundException("TourHotel not found with id: " + id);
                });

        tourHotelRepository.delete(tourHotel);
        log.info("TourHotel id [{}] removed successfully", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourHotelDto> getHotelsByTourId(Long tourId) {
        log.debug("Fetching all hotels for tour [{}]", tourId);

        List<TourHotelDto> result = tourHotelRepository.findAllByTourId(tourId)
                .stream()
                .map(tourHotelMapper::toDto)
                .collect(Collectors.toUnmodifiableList());

        log.debug("Found [{}] hotels for tour [{}]", result.size(), tourId);
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public TourHotelDto getTourHotelById(Long id) {
        log.debug("Fetching TourHotel id [{}]", id);

        TourHotel tourHotel = tourHotelRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("TourHotel id [{}] not found", id);
                    return new TourHotelNotFoundException("TourHotel not found with id: " + id);
                });

        return tourHotelMapper.toDto(tourHotel);
    }
}

