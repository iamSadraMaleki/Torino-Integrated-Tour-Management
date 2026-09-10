package com.example.project.ceo_food.inventory.services;

import com.example.project.ceo_food.inventory.dto.InventoryItemRequest;
import com.example.project.ceo_food.inventory.dto.InventoryItemResponse;
import com.example.project.ceo_food.inventory.dto.InventoryStatsResponse;
import com.example.project.ceo_food.inventory.model.InventoryCategory;
import com.example.project.ceo_food.inventory.model.InventoryItem;
import com.example.project.ceo_food.inventory.repository.InventoryItemRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryItemRepository inventoryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public InventoryItemResponse create(String ceoUsername, InventoryItemRequest request) {
        User user = findUser(ceoUsername);

        InventoryItem item = InventoryItem.builder()
                .user(user)
                .name(request.getName().trim())
                .category(parseCategory(request.getCategory()))
                .unit(request.getUnit() != null && !request.getUnit().isBlank() ? request.getUnit().trim() : "عدد")
                .quantity(request.getQuantity() != null ? request.getQuantity() : BigDecimal.ZERO)
                .minQuantity(request.getMinQuantity() != null ? request.getMinQuantity() : BigDecimal.ZERO)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .build();

        item = inventoryRepository.save(item);
        log.info("Inventory item [{}] created by {}", item.getName(), ceoUsername);
        return toResponse(item);
    }

    @Override
    @Transactional
    public InventoryItemResponse update(String ceoUsername, Long itemId, InventoryItemRequest request) {
        User user = findUser(ceoUsername);
        InventoryItem item = inventoryRepository.findByIdAndUserId(itemId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "قلم انبار پیدا نشد یا متعلق به شما نیست"));

        item.setName(request.getName().trim());
        item.setCategory(parseCategory(request.getCategory()));
        if (request.getUnit() != null && !request.getUnit().isBlank()) {
            item.setUnit(request.getUnit().trim());
        }
        item.setQuantity(request.getQuantity() != null ? request.getQuantity() : BigDecimal.ZERO);
        item.setMinQuantity(request.getMinQuantity() != null ? request.getMinQuantity() : BigDecimal.ZERO);
        item.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);

        item = inventoryRepository.save(item);
        log.info("Inventory item [{}] updated by {}", item.getId(), ceoUsername);
        return toResponse(item);
    }

    @Override
    @Transactional
    public void delete(String ceoUsername, Long itemId) {
        User user = findUser(ceoUsername);
        InventoryItem item = inventoryRepository.findByIdAndUserId(itemId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "قلم انبار پیدا نشد یا متعلق به شما نیست"));
        inventoryRepository.delete(item);
        log.info("Inventory item [{}] deleted by {}", itemId, ceoUsername);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryItemResponse getById(String ceoUsername, Long itemId) {
        User user = findUser(ceoUsername);
        InventoryItem item = inventoryRepository.findByIdAndUserId(itemId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "قلم انبار پیدا نشد یا متعلق به شما نیست"));
        return toResponse(item);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryItemResponse> getAll(String ceoUsername) {
        User user = findUser(ceoUsername);
        return inventoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InventoryItemResponse adjustQuantity(String ceoUsername, Long itemId, BigDecimal delta) {
        User user = findUser(ceoUsername);
        InventoryItem item = inventoryRepository.findByIdAndUserId(itemId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "قلم انبار پیدا نشد یا متعلق به شما نیست"));

        BigDecimal newQuantity = item.getQuantity().add(delta);
        if (newQuantity.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "موجودی نمی‌تواند منفی شود (موجودی فعلی: " + item.getQuantity() + ")");
        }
        item.setQuantity(newQuantity);
        item = inventoryRepository.save(item);
        log.info("Inventory item [{}] quantity adjusted by {} (now {}) by {}",
                itemId, delta, newQuantity, ceoUsername);
        return toResponse(item);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryStatsResponse getStatistics(String ceoUsername) {
        User user = findUser(ceoUsername);
        Long userId = user.getId();

        long totalItems = inventoryRepository.countByUserId(userId);
        long lowStockCount = inventoryRepository.countLowStock(userId);
        BigDecimal totalQuantity = inventoryRepository.sumQuantity(userId);

        List<InventoryStatsResponse.CategoryCount> byCategory = new ArrayList<>();
        for (Object[] row : inventoryRepository.countByCategory(userId)) {
            InventoryCategory category = (InventoryCategory) row[0];
            byCategory.add(InventoryStatsResponse.CategoryCount.builder()
                    .category(category.name())
                    .categoryPersian(categoryPersian(category))
                    .count(((Number) row[1]).longValue())
                    .build());
        }

        return InventoryStatsResponse.builder()
                .totalItems(totalItems)
                .lowStockCount(lowStockCount)
                .totalQuantity(totalQuantity)
                .byCategory(byCategory)
                .build();
    }

    // ===================== helper ها =====================

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "کاربر یافت نشد"));
    }

    private InventoryCategory parseCategory(String category) {
        try {
            return InventoryCategory.valueOf(category != null ? category.trim().toUpperCase() : "");
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "دسته‌بندی نامعتبر است — باید FOOD، DRINK، DESSERT یا OTHER باشد");
        }
    }

    private String categoryPersian(InventoryCategory category) {
        switch (category) {
            case FOOD: return "مواد غذایی";
            case DRINK: return "نوشیدنی";
            case DESSERT: return "دسر";
            default: return "سایر";
        }
    }

    private InventoryItemResponse toResponse(InventoryItem item) {
        return InventoryItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .category(item.getCategory().name())
                .categoryPersian(categoryPersian(item.getCategory()))
                .unit(item.getUnit())
                .quantity(item.getQuantity())
                .minQuantity(item.getMinQuantity())
                .lowStock(item.getQuantity().compareTo(item.getMinQuantity()) <= 0)
                .description(item.getDescription())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
