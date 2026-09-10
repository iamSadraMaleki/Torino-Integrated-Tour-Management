package com.example.project.ceo_tour.tour_food.services;

import com.example.project.ceo_food.model.BaseFood;
import com.example.project.ceo_food.repository.BaseFoodRepository;
import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.ceo_tour.tour.repository.TourRepository;
import com.example.project.ceo_tour.tour_food.dto.AddTourDrinkRequest;
import com.example.project.ceo_tour.tour_food.dto.TourDrinkDto;
import com.example.project.ceo_tour.tour_food.dto.TourDrinkMapper;
import com.example.project.ceo_tour.tour_food.dto.UpdateTourDrinkRequest;
import com.example.project.ceo_tour.tour_food.model.TourDrink;
import com.example.project.ceo_tour.tour_food.repository.TourDrinkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourDrinkServiceImpl implements TourDrinkService {

    private static final int MAX_DRINKS_PER_DAY = 2;

    private final TourDrinkRepository tourDrinkRepository;
    private final BaseFoodRepository baseFoodRepository;
    private final TourRepository tourRepository;
    private final TourDrinkMapper tourDrinkMapper;

    private Tour findTourById(Long tourId) {
        return tourRepository.findById(tourId)
                .orElseThrow(() -> {
                    log.warn("Tour not found with id [{}]", tourId);
                    return new TourDrinkNotFoundException("Tour not found with id: " + tourId);
                });
    }

    private BaseFood findBaseFoodById(Long baseFoodId) {
        return baseFoodRepository.findById(baseFoodId)
                .orElseThrow(() -> {
                    log.warn("BaseFood not found with id [{}]", baseFoodId);
                    return new TourDrinkNotFoundException("Base food not found with id: " + baseFoodId);
                });
    }

    private void validateMaxDrinkPerDay(Long tourId, String serveDay) {
        long count = tourDrinkRepository.countByTourIdAndServeDay(tourId, serveDay);
        if (count >= MAX_DRINKS_PER_DAY) {
            log.warn("Max drinks per day exceeded for tour [{}] on day [{}]", tourId, serveDay);
            throw new MaxDrinkPerDayExceededException(
                    "Maximum " + MAX_DRINKS_PER_DAY + " drinks allowed per day. Day: " + serveDay);
        }
    }

    private void validateMaxDrinkPerDayForUpdate(Long tourId, String serveDay, Long excludeId) {
        long count = tourDrinkRepository.countByTourIdAndServeDayExcluding(tourId, serveDay, excludeId);
        if (count >= MAX_DRINKS_PER_DAY) {
            log.warn("Max drinks per day exceeded for tour [{}] on day [{}] during update", tourId, serveDay);
            throw new MaxDrinkPerDayExceededException(
                    "Maximum " + MAX_DRINKS_PER_DAY + " drinks allowed per day. Day: " + serveDay);
        }
    }

    @Override
    @Transactional
    public TourDrinkDto add(AddTourDrinkRequest request) {
        log.info("Adding drink [{}] to tour [{}] on day [{}]",
                request.getBaseFoodId(), request.getTourId(), request.getServeDay());

        validateMaxDrinkPerDay(request.getTourId(), request.getServeDay());

        Tour tour = findTourById(request.getTourId());
        BaseFood baseFood = findBaseFoodById(request.getBaseFoodId());

        TourDrink tourDrink = TourDrink.builder()
                .tour(tour)
                .baseFood(baseFood)
                .serveDay(request.getServeDay())
                .price(request.getPrice())
                .build();

        TourDrink saved = tourDrinkRepository.save(tourDrink);
        log.info("TourDrink created with id [{}] for tour [{}]", saved.getId(), tour.getId());

        return tourDrinkMapper.toDto(saved);
    }

    @Override
    @Transactional
    public TourDrinkDto update(Long id, UpdateTourDrinkRequest request) {
        log.info("Updating TourDrink id [{}]", id);

        TourDrink tourDrink = tourDrinkRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("TourDrink id [{}] not found", id);
                    return new TourDrinkNotFoundException("TourDrink not found with id: " + id);
                });

        if (!tourDrink.getServeDay().equals(request.getServeDay())) {
            validateMaxDrinkPerDayForUpdate(tourDrink.getTour().getId(), request.getServeDay(), id);
        }

        tourDrink.setServeDay(request.getServeDay());
        tourDrink.setPrice(request.getPrice());

        TourDrink updated = tourDrinkRepository.save(tourDrink);
        log.info("TourDrink id [{}] updated successfully", updated.getId());

        return tourDrinkMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        log.info("Deleting TourDrink id [{}]", id);

        TourDrink tourDrink = tourDrinkRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("TourDrink id [{}] not found during delete", id);
                    return new TourDrinkNotFoundException("TourDrink not found with id: " + id);
                });

        tourDrinkRepository.delete(tourDrink);
        log.info("TourDrink id [{}] deleted successfully", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourDrinkDto> getByTour(Long tourId) {
        log.debug("Fetching all drinks for tour [{}]", tourId);

        List<TourDrinkDto> result = tourDrinkRepository.findAllByTourId(tourId)
                .stream()
                .map(tourDrinkMapper::toDto)
                .collect(Collectors.toUnmodifiableList());

        log.debug("Found [{}] drinks for tour [{}]", result.size(), tourId);
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public TourDrinkDto getById(Long id) {
        log.debug("Fetching TourDrink id [{}]", id);

        TourDrink tourDrink = tourDrinkRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("TourDrink id [{}] not found", id);
                    return new TourDrinkNotFoundException("TourDrink not found with id: " + id);
                });

        return tourDrinkMapper.toDto(tourDrink);
    }
}
