package com.example.project.ceo_food.shopping.repository;

import com.example.project.ceo_food.shopping.model.ShoppingItem;
import com.example.project.ceo_food.shopping.model.ShoppingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ShoppingItemRepository extends JpaRepository<ShoppingItem, Long> {

    List<ShoppingItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<ShoppingItem> findByIdAndUserId(Long id, Long userId);

    /** تعداد اقلام در انتظار خرید */
    long countByUserIdAndStatus(Long userId, ShoppingStatus status);

    /** مجموع مقدار خریداری‌شده */
    @Query("SELECT COALESCE(SUM(s.quantity), 0) FROM ShoppingItem s WHERE s.user.id = :userId AND s.status = 'PURCHASED'")
    BigDecimal sumPurchasedQuantity(@Param("userId") Long userId);
}
