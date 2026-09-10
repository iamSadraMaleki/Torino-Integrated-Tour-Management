package com.example.project.ceo_food.services;

import com.example.project.ceo_food.dto.BaseFoodDto;
import com.example.project.ceo_food.dto.BaseFoodMapper;
import com.example.project.ceo_food.dto.CreateBaseFoodRequest;
import com.example.project.ceo_food.model.BaseFood;
import com.example.project.ceo_food.model.BaseFoodIngredient;
import com.example.project.ceo_food.repository.BaseFoodRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BaseFoodServiceImpl implements BaseFoodService {

    private final BaseFoodRepository baseFoodRepository;
    private final UserRepository userRepository;
    private final BaseFoodMapper baseFoodMapper;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.debug("Fetching current user: {}", username);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("Authenticated user not found: {}", username);
                    return new IllegalStateException("Authenticated user not found: " + username);
                });
    }

    @Override
    @Transactional
    public BaseFoodDto create(CreateBaseFoodRequest request) {
        User user = getCurrentUser();
        log.info("User [{}] is creating base food: {}", user.getUsername(), request.getName());

        if (baseFoodRepository.existsByNameAndUserId(request.getName(), user.getId())) {
            log.warn("User [{}] attempted to create duplicate food: {}", user.getUsername(), request.getName());
            throw new DuplicateBaseFoodException("Food with name '" + request.getName() + "' already exists");
        }

        BaseFood food = BaseFood.builder()
                .user(user)
                .name(request.getName())
                .foodType(request.getFoodType())
                .mealType(request.getMealType())
                .build();

        if (request.getIngredients() != null && !request.getIngredients().isEmpty()) {
            List<BaseFoodIngredient> ingredients = request.getIngredients().stream()
                    .map(i -> baseFoodMapper.toIngredientEntity(i, food))
                    .collect(Collectors.toList());
            food.getIngredients().addAll(ingredients);
        }

        BaseFood saved = baseFoodRepository.save(food);
        log.info("Base food created with id [{}] for user [{}]", saved.getId(), user.getUsername());

        return baseFoodMapper.toDto(saved);
    }

    @Override
    @Transactional
    public BaseFoodDto update(Long id, CreateBaseFoodRequest request) {
        User user = getCurrentUser();
        log.info("User [{}] is updating base food id [{}]", user.getUsername(), id);

        BaseFood food = baseFoodRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> {
                    log.warn("Base food id [{}] not found for user [{}]", id, user.getUsername());
                    return new BaseFoodNotFoundException("Base food not found with id: " + id);
                });

        food.setName(request.getName());
        food.setFoodType(request.getFoodType());
        food.setMealType(request.getMealType());

        // با orphanRemoval=true اول پاک میکنیم بعد دوباره اضافه میکنیم
        food.getIngredients().clear();
        if (request.getIngredients() != null && !request.getIngredients().isEmpty()) {
            List<BaseFoodIngredient> newIngredients = request.getIngredients().stream()
                    .map(i -> baseFoodMapper.toIngredientEntity(i, food))
                    .collect(Collectors.toList());
            food.getIngredients().addAll(newIngredients);
        }

        BaseFood updated = baseFoodRepository.save(food);
        log.info("Base food id [{}] updated successfully", updated.getId());

        return baseFoodMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User user = getCurrentUser();
        log.info("User [{}] is deleting base food id [{}]", user.getUsername(), id);

        BaseFood food = baseFoodRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> {
                    log.warn("Base food id [{}] not found for user [{}] during delete", id, user.getUsername());
                    return new BaseFoodNotFoundException("Base food not found with id: " + id);
                });

        baseFoodRepository.delete(food);
        log.info("Base food id [{}] deleted successfully by user [{}]", id, user.getUsername());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BaseFoodDto> getMyFoods() {
        User user = getCurrentUser();
        log.debug("Fetching all base foods for user [{}]", user.getUsername());

        List<BaseFoodDto> foods = baseFoodRepository.findAllByUserId(user.getId())
                .stream()
                .map(baseFoodMapper::toDto)
                .collect(Collectors.toUnmodifiableList());

        log.debug("Found [{}] base foods for user [{}]", foods.size(), user.getUsername());
        return foods;
    }

    @Override
    @Transactional(readOnly = true)
    public BaseFoodDto getById(Long id) {
        User user = getCurrentUser();
        log.debug("Fetching base food id [{}] for user [{}]", id, user.getUsername());

        BaseFood food = baseFoodRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> {
                    log.warn("Base food id [{}] not found for user [{}]", id, user.getUsername());
                    return new BaseFoodNotFoundException("Base food not found with id: " + id);
                });

        return baseFoodMapper.toDto(food);
    }
}
