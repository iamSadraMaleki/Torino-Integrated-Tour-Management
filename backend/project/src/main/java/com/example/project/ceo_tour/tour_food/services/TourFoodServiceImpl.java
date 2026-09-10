package com.example.project.ceo_tour.tour_food.services;

import com.example.project.ceo_food.model.BaseFood;
import com.example.project.ceo_food.model.FoodType;
import com.example.project.ceo_food.model.MealType;
import com.example.project.ceo_food.repository.BaseFoodRepository;
import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.ceo_tour.tour.repository.TourRepository;
import com.example.project.ceo_tour.tour_food.dto.*;
import com.example.project.ceo_tour.tour_food.model.TourFood;
import com.example.project.ceo_tour.tour_food.repository.TourFoodRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourFoodServiceImpl implements TourFoodService {

    /** حداکثر ۲ غذا در هر وعده (مثلاً ناهار) در هر روز — تکرار همان غذا در روزهای دیگر آزاد است */
    private static final int MAX_FOODS_PER_MEAL = 2;

    private final TourFoodRepository tourFoodRepository;
    private final BaseFoodRepository baseFoodRepository;
    private final TourRepository tourRepository;
    private final TourFoodMapper tourFoodMapper;

    private Tour findTourById(Long tourId) {
        return tourRepository.findById(tourId)
                .orElseThrow(() -> {
                    log.warn("Tour not found with id [{}]", tourId);
                    return new TourFoodNotFoundException("Tour not found with id: " + tourId);
                });
    }

    private BaseFood findAndValidateBaseFood(Long baseFoodId) {
        BaseFood baseFood = baseFoodRepository.findById(baseFoodId)
                .orElseThrow(() -> {
                    log.warn("BaseFood not found with id [{}]", baseFoodId);
                    return new TourFoodNotFoundException("Base food not found with id: " + baseFoodId);
                });

        if (baseFood.getFoodType() != FoodType.IRANIAN &&
                baseFood.getFoodType() != FoodType.INTERNATIONAL &&
                baseFood.getFoodType() != FoodType.FAST_FOOD &&
                baseFood.getFoodType() != FoodType.VEGETARIAN &&
                baseFood.getFoodType() != FoodType.VEGAN &&
                baseFood.getFoodType() != FoodType.OTHER) {
            // اگر در آینده FoodType هایی مثل DRINK یا DESSERT اضافه شدن اینجا فیلتر میشه
            log.warn("BaseFood id [{}] has incompatible food type: {}", baseFoodId, baseFood.getFoodType());
            throw new InvalidFoodTypeException("Selected item has incompatible food type: " + baseFood.getFoodType());
        }

        return baseFood;
    }

    /** بررسی حداکثر ۲ غذا در هر وعده از یک روز (برای add) */
    private void validateMaxFoodPerMeal(Long tourId, String serveDay, MealType mealType, Long baseFoodId) {
        long count = tourFoodRepository.countByTourIdAndServeDayAndMealType(tourId, serveDay, mealType);
        if (count >= MAX_FOODS_PER_MEAL) {
            log.warn("Max food per meal exceeded for tour [{}] on day [{}] meal [{}]", tourId, serveDay, mealType);
            throw new MaxFoodPerDayExceededException(
                    "در هر وعده حداکثر " + MAX_FOODS_PER_MEAL + " غذا مجاز است. وعده " + mealType + " روز " + serveDay + " کامل است"
            );
        }
        boolean duplicate = tourFoodRepository.existsDuplicateFoodInMeal(tourId, serveDay, mealType, baseFoodId, -1L);
        if (duplicate) {
            log.warn("Duplicate food [{}] in same meal [{}] of day [{}] for tour [{}]", baseFoodId, mealType, serveDay, tourId);
            throw new MaxFoodPerDayExceededException(
                    "این غذا قبلاً در همین وعده و روز اضافه شده است. تکرار همان غذا فقط در روزهای دیگر مجاز است"
            );
        }
    }

    /** بررسی محدودیت برای update (بدون احتساب رکورد فعلی) */
    private void validateMaxFoodPerMealForUpdate(Long tourId, String serveDay, MealType mealType, Long baseFoodId, Long excludeId) {
        long count = tourFoodRepository.countByTourIdAndServeDayAndMealTypeExcluding(tourId, serveDay, mealType, excludeId);
        if (count >= MAX_FOODS_PER_MEAL) {
            log.warn("Max food per meal exceeded for tour [{}] on day [{}] meal [{}] during update", tourId, serveDay, mealType);
            throw new MaxFoodPerDayExceededException(
                    "در هر وعده حداکثر " + MAX_FOODS_PER_MEAL + " غذا مجاز است. وعده " + mealType + " روز " + serveDay + " کامل است"
            );
        }
        boolean duplicate = tourFoodRepository.existsDuplicateFoodInMeal(tourId, serveDay, mealType, baseFoodId, excludeId);
        if (duplicate) {
            log.warn("Duplicate food [{}] in same meal [{}] of day [{}] for tour [{}] during update", baseFoodId, mealType, serveDay, tourId);
            throw new MaxFoodPerDayExceededException(
                    "این غذا قبلاً در همین وعده و روز اضافه شده است. تکرار همان غذا فقط در روزهای دیگر مجاز است"
            );
        }
    }

    @Override
    @Transactional
    public TourFoodDto add(AddTourFoodRequest request) {
        log.info("Adding food [{}] to tour [{}] on day [{}]",
                request.getBaseFoodId(), request.getTourId(), request.getServeDay());

        Tour tour = findTourById(request.getTourId());
        BaseFood baseFood = findAndValidateBaseFood(request.getBaseFoodId());

        validateMaxFoodPerMeal(request.getTourId(), request.getServeDay(), baseFood.getMealType(), baseFood.getId());

        TourFood tourFood = TourFood.builder()
                .tour(tour)
                .baseFood(baseFood)
                .serveDay(request.getServeDay())
                .price(request.getPrice())
                .build();

        TourFood saved = tourFoodRepository.save(tourFood);
        log.info("TourFood created with id [{}] for tour [{}]", saved.getId(), tour.getId());

        return tourFoodMapper.toDto(saved);
    }

    @Override
    @Transactional
    public TourFoodDto update(Long id, UpdateTourFoodRequest request) {
        log.info("Updating TourFood id [{}]", id);

        TourFood tourFood = tourFoodRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("TourFood id [{}] not found", id);
                    return new TourFoodNotFoundException("TourFood not found with id: " + id);
                });

        boolean dayChanged = !tourFood.getServeDay().equals(request.getServeDay());
        if (dayChanged) {
            // باگ کد قبلی: رکورد فعلی رو از count خارج نمیکرد
            // محدودیت بر اساس وعده غذایی همان غذا (mealType ثابت می‌ماند چون فقط روز عوض می‌شود)
            MealType mealType = tourFood.getBaseFood().getMealType();
            Long baseFoodId = tourFood.getBaseFood().getId();
            validateMaxFoodPerMealForUpdate(tourFood.getTour().getId(), request.getServeDay(), mealType, baseFoodId, id);
        }

        tourFood.setServeDay(request.getServeDay());
        tourFood.setPrice(request.getPrice());

        TourFood updated = tourFoodRepository.save(tourFood);
        log.info("TourFood id [{}] updated successfully", updated.getId());

        return tourFoodMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        log.info("Deleting TourFood id [{}]", id);

        TourFood tourFood = tourFoodRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("TourFood id [{}] not found during delete", id);
                    return new TourFoodNotFoundException("TourFood not found with id: " + id);
                });

        tourFoodRepository.delete(tourFood);
        log.info("TourFood id [{}] deleted successfully", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourFoodDto> getByTour(Long tourId) {
        log.debug("Fetching all foods for tour [{}]", tourId);

        List<TourFoodDto> result = tourFoodRepository.findAllByTourId(tourId)
                .stream()
                .map(tourFoodMapper::toDto)
                .collect(Collectors.toUnmodifiableList());

        log.debug("Found [{}] foods for tour [{}]", result.size(), tourId);
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public TourFoodDto getById(Long id) {
        log.debug("Fetching TourFood id [{}]", id);

        TourFood tourFood = tourFoodRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("TourFood id [{}] not found", id);
                    return new TourFoodNotFoundException("TourFood not found with id: " + id);
                });

        return tourFoodMapper.toDto(tourFood);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourMenuByDayDto> getMenuGroupedByDay(Long tourId) {
        log.debug("Fetching menu grouped by day for tour [{}]", tourId);

        Map<String, List<TourFoodDto>> grouped = tourFoodRepository
                .findAllByTourIdOrderByServeDayAsc(tourId)
                .stream()
                .map(tourFoodMapper::toDto)
                .collect(Collectors.groupingBy(TourFoodDto::getServeDay));

        List<TourMenuByDayDto> menu = grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> TourMenuByDayDto.builder()
                        .serveDay(entry.getKey())
                        .foods(entry.getValue())
                        .build())
                .collect(Collectors.toUnmodifiableList());

        log.debug("Tour [{}] has food menu for [{}] days", tourId, menu.size());
        return menu;
    }
}
