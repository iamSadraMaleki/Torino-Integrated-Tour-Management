package com.example.project.ceo_tour.tour_food.services;

import com.example.project.ceo_food.model.BaseFood;
import com.example.project.ceo_food.repository.BaseFoodRepository;
import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.ceo_tour.tour.repository.TourRepository;
import com.example.project.ceo_tour.tour_food.dto.AddTourDessertRequest;
import com.example.project.ceo_tour.tour_food.dto.TourDessertDto;
import com.example.project.ceo_tour.tour_food.dto.TourDessertMapper;
import com.example.project.ceo_tour.tour_food.dto.UpdateTourDessertRequest;
import com.example.project.ceo_tour.tour_food.model.TourDessert;
import com.example.project.ceo_tour.tour_food.repository.TourDessertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourDessertServiceImpl implements TourDessertService {

    private static final int MAX_DESSERTS_PER_DAY = 2;

    private final TourDessertRepository tourDessertRepository;
    private final BaseFoodRepository baseFoodRepository;
    private final TourRepository tourRepository;
    private final TourDessertMapper tourDessertMapper;

    private Tour findTourById(Long tourId) {
        return tourRepository.findById(tourId)
                .orElseThrow(() -> {
                    log.warn("Tour not found with id [{}]", tourId);
                    return new TourDessertNotFoundException("Tour not found with id: " + tourId);
                });
    }

    private BaseFood findBaseFoodById(Long baseFoodId) {
        return baseFoodRepository.findById(baseFoodId)
                .orElseThrow(() -> {
                    log.warn("BaseFood not found with id [{}]", baseFoodId);
                    return new TourDessertNotFoundException("Base food not found with id: " + baseFoodId);
                });
    }

    private void validateMaxDessertPerDay(Long tourId, String serveDay) {
        long count = tourDessertRepository.countByTourIdAndServeDay(tourId, serveDay);
        if (count >= MAX_DESSERTS_PER_DAY) {
            log.warn("Max desserts per day exceeded for tour [{}] on day [{}]", tourId, serveDay);
            throw new MaxDessertPerDayExceededException(
                    "Maximum " + MAX_DESSERTS_PER_DAY + " desserts allowed per day. Day: " + serveDay);
        }
    }

    private void validateMaxDessertPerDayForUpdate(Long tourId, String serveDay, Long excludeId) {
        long count = tourDessertRepository.countByTourIdAndServeDayExcluding(tourId, serveDay, excludeId);
        if (count >= MAX_DESSERTS_PER_DAY) {
            log.warn("Max desserts per day exceeded during update for tour [{}] day [{}]", tourId, serveDay);
            throw new MaxDessertPerDayExceededException(
                    "Maximum " + MAX_DESSERTS_PER_DAY + " desserts allowed per day. Day: " + serveDay);
        }
    }

    @Override
    @Transactional
    public TourDessertDto add(AddTourDessertRequest request) {
        log.info("Adding dessert [{}] to tour [{}] on day [{}]",
                request.getBaseFoodId(), request.getTourId(), request.getServeDay());

        validateMaxDessertPerDay(request.getTourId(), request.getServeDay());

        Tour tour = findTourById(request.getTourId());
        BaseFood baseFood = findBaseFoodById(request.getBaseFoodId());

        TourDessert tourDessert = TourDessert.builder()
                .tour(tour)
                .baseFood(baseFood)
                .serveDay(request.getServeDay())
                .price(request.getPrice())
                .build();

        TourDessert saved = tourDessertRepository.save(tourDessert);
        log.info("TourDessert created with id [{}] for tour [{}]", saved.getId(), tour.getId());

        return tourDessertMapper.toDto(saved);
    }

    @Override
    @Transactional
    public TourDessertDto update(Long id, UpdateTourDessertRequest request) {
        log.info("Updating TourDessert id [{}]", id);

        TourDessert tourDessert = tourDessertRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("TourDessert id [{}] not found", id);
                    return new TourDessertNotFoundException("TourDessert not found with id: " + id);
                });

        if (!tourDessert.getServeDay().equals(request.getServeDay())) {
            validateMaxDessertPerDayForUpdate(tourDessert.getTour().getId(), request.getServeDay(), id);
        }

        tourDessert.setServeDay(request.getServeDay());
        tourDessert.setPrice(request.getPrice());

        TourDessert updated = tourDessertRepository.save(tourDessert);
        log.info("TourDessert id [{}] updated successfully", updated.getId());

        return tourDessertMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        log.info("Deleting TourDessert id [{}]", id);

        TourDessert tourDessert = tourDessertRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("TourDessert id [{}] not found during delete", id);
                    return new TourDessertNotFoundException("TourDessert not found with id: " + id);
                });

        tourDessertRepository.delete(tourDessert);
        log.info("TourDessert id [{}] deleted successfully", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourDessertDto> getByTour(Long tourId) {
        log.debug("Fetching all desserts for tour [{}]", tourId);

        List<TourDessertDto> result = tourDessertRepository.findAllByTourId(tourId)
                .stream()
                .map(tourDessertMapper::toDto)
                .collect(Collectors.toUnmodifiableList());

        log.debug("Found [{}] desserts for tour [{}]", result.size(), tourId);
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public TourDessertDto getById(Long id) {
        log.debug("Fetching TourDessert id [{}]", id);

        TourDessert tourDessert = tourDessertRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("TourDessert id [{}] not found", id);
                    return new TourDessertNotFoundException("TourDessert not found with id: " + id);
                });

        return tourDessertMapper.toDto(tourDessert);
    }
}
