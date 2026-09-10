package com.example.project.ceo_food.shopping.services;

import com.example.project.ceo_food.inventory.model.InventoryItem;
import com.example.project.ceo_food.inventory.repository.InventoryItemRepository;
import com.example.project.ceo_food.shopping.dto.ShoppingItemRequest;
import com.example.project.ceo_food.shopping.dto.ShoppingItemResponse;
import com.example.project.ceo_food.shopping.dto.ShoppingStatsResponse;
import com.example.project.ceo_food.shopping.model.ShoppingItem;
import com.example.project.ceo_food.shopping.model.ShoppingStatus;
import com.example.project.ceo_food.shopping.repository.ShoppingItemRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShoppingServiceImpl implements ShoppingService {

    private final ShoppingItemRepository shoppingRepository;
    private final InventoryItemRepository inventoryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ShoppingItemResponse create(String ceoUsername, ShoppingItemRequest request) {
        User user = findUser(ceoUsername);
        validateInventoryLink(user, request.getInventoryItemId());

        ShoppingItem item = ShoppingItem.builder()
                .user(user)
                .name(request.getName().trim())
                .quantity(request.getQuantity())
                .unit(request.getUnit() != null && !request.getUnit().isBlank() ? request.getUnit().trim() : "عدد")
                .status(ShoppingStatus.PENDING)
                .note(request.getNote() != null ? request.getNote().trim() : null)
                .inventoryItemId(request.getInventoryItemId())
                .createdBy(ceoUsername)
                .build();

        item = shoppingRepository.save(item);
        log.info("Shopping item [{}] created by {}", item.getName(), ceoUsername);
        return toResponse(item);
    }

    @Override
    @Transactional
    public ShoppingItemResponse update(String ceoUsername, Long itemId, ShoppingItemRequest request) {
        User user = findUser(ceoUsername);
        ShoppingItem item = shoppingRepository.findByIdAndUserId(itemId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "قلم لیست خرید پیدا نشد یا متعلق به شما نیست"));

        if (item.getStatus() != ShoppingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "فقط اقلام در انتظار خرید قابل ویرایش هستند");
        }
        validateInventoryLink(user, request.getInventoryItemId());

        item.setName(request.getName().trim());
        item.setQuantity(request.getQuantity());
        if (request.getUnit() != null && !request.getUnit().isBlank()) {
            item.setUnit(request.getUnit().trim());
        }
        item.setNote(request.getNote() != null ? request.getNote().trim() : null);
        item.setInventoryItemId(request.getInventoryItemId());

        item = shoppingRepository.save(item);
        return toResponse(item);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShoppingItemResponse> getAll(String ceoUsername) {
        User user = findUser(ceoUsername);
        return shoppingRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ShoppingItemResponse markPurchased(String ceoUsername, Long itemId) {
        User user = findUser(ceoUsername);
        ShoppingItem item = shoppingRepository.findByIdAndUserId(itemId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "قلم لیست خرید پیدا نشد یا متعلق به شما نیست"));

        if (item.getStatus() == ShoppingStatus.PURCHASED) {
            return toResponse(item);
        }
        if (item.getStatus() == ShoppingStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "قلم لغوشده را نمی‌توان خریداری‌شده کرد — دوباره ثبت کنید");
        }

        // اگر به انبار لینک شده، موجودی خودکار زیاد می‌شود
        if (item.getInventoryItemId() != null) {
            InventoryItem inv = inventoryRepository.findByIdAndUserId(item.getInventoryItemId(), user.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "قلم انبار مرتبط پیدا نشد"));
            inv.setQuantity(inv.getQuantity().add(item.getQuantity()));
            inventoryRepository.save(inv);
            log.info("Inventory item [{}] increased by {} (auto from shopping item [{}])",
                    inv.getId(), item.getQuantity(), item.getId());
        }

        item.setStatus(ShoppingStatus.PURCHASED);
        item.setPurchasedAt(LocalDateTime.now());
        item = shoppingRepository.save(item);
        log.info("Shopping item [{}] marked as PURCHASED by {}", itemId, ceoUsername);
        return toResponse(item);
    }

    @Override
    @Transactional
    public ShoppingItemResponse cancel(String ceoUsername, Long itemId) {
        User user = findUser(ceoUsername);
        ShoppingItem item = shoppingRepository.findByIdAndUserId(itemId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "قلم لیست خرید پیدا نشد یا متعلق به شما نیست"));

        if (item.getStatus() == ShoppingStatus.PENDING) {
            item.setStatus(ShoppingStatus.CANCELLED);
            item = shoppingRepository.save(item);
            log.info("Shopping item [{}] cancelled by {}", itemId, ceoUsername);
        }
        return toResponse(item);
    }

    @Override
    @Transactional
    public void delete(String ceoUsername, Long itemId) {
        User user = findUser(ceoUsername);
        ShoppingItem item = shoppingRepository.findByIdAndUserId(itemId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "قلم لیست خرید پیدا نشد یا متعلق به شما نیست"));
        shoppingRepository.delete(item);
        log.info("Shopping item [{}] deleted by {}", itemId, ceoUsername);
    }

    @Override
    @Transactional(readOnly = true)
    public ShoppingStatsResponse getStatistics(String ceoUsername) {
        User user = findUser(ceoUsername);
        Long userId = user.getId();
        return ShoppingStatsResponse.builder()
                .pendingCount(shoppingRepository.countByUserIdAndStatus(userId, ShoppingStatus.PENDING))
                .purchasedCount(shoppingRepository.countByUserIdAndStatus(userId, ShoppingStatus.PURCHASED))
                .cancelledCount(shoppingRepository.countByUserIdAndStatus(userId, ShoppingStatus.CANCELLED))
                .purchasedQuantity(shoppingRepository.sumPurchasedQuantity(userId))
                .build();
    }

    // ===================== helper ها =====================

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "کاربر یافت نشد"));
    }

    private void validateInventoryLink(User user, Long inventoryItemId) {
        if (inventoryItemId != null) {
            inventoryRepository.findByIdAndUserId(inventoryItemId, user.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "قلم انبار مرتبط پیدا نشد یا متعلق به شما نیست"));
        }
    }

    private String statusPersian(ShoppingStatus status) {
        switch (status) {
            case PURCHASED: return "خریداری شد";
            case CANCELLED: return "لغو شد";
            default: return "در انتظار خرید";
        }
    }

    private ShoppingItemResponse toResponse(ShoppingItem item) {
        String inventoryName = null;
        if (item.getInventoryItemId() != null) {
            var opt = inventoryRepository.findById(item.getInventoryItemId());
            if (opt.isPresent()) {
                inventoryName = opt.get().getName();
            }
        }
        return ShoppingItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .quantity(item.getQuantity())
                .unit(item.getUnit())
                .status(item.getStatus().name())
                .statusPersian(statusPersian(item.getStatus()))
                .note(item.getNote())
                .inventoryItemId(item.getInventoryItemId())
                .inventoryItemName(inventoryName)
                .createdBy(item.getCreatedBy())
                .createdAt(item.getCreatedAt())
                .purchasedAt(item.getPurchasedAt())
                .build();
    }
}
