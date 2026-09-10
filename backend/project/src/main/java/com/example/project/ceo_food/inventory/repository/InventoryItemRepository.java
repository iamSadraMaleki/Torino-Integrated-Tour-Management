package com.example.project.ceo_food.inventory.repository;

import com.example.project.ceo_food.inventory.model.InventoryCategory;
import com.example.project.ceo_food.inventory.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    List<InventoryItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<InventoryItem> findByIdAndUserId(Long id, Long userId);

    /** تعداد اقلام کمبود (موجودی کمتر یا مساوی حداقل) */
    @Query("SELECT COUNT(i) FROM InventoryItem i WHERE i.user.id = :userId AND i.quantity <= i.minQuantity")
    long countLowStock(@Param("userId") Long userId);

    /** مجموع مقدار موجودی */
    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM InventoryItem i WHERE i.user.id = :userId")
    BigDecimal sumQuantity(@Param("userId") Long userId);

    /** تعداد به تفکیک دسته‌بندی */
    @Query("SELECT i.category, COUNT(i) FROM InventoryItem i WHERE i.user.id = :userId GROUP BY i.category")
    List<Object[]> countByCategory(@Param("userId") Long userId);

    long countByUserId(Long userId);
}
