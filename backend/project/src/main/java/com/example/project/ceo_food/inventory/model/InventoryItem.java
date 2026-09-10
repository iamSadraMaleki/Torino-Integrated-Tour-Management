package com.example.project.ceo_food.inventory.model;

import com.example.project.users.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * انبار — موجودی اقلام (مواد غذایی، نوشیدنی، دسر و ...) هر مدیر آژانس
 */
@Entity
@Table(name = "inventory_items",
        indexes = {
                @Index(name = "idx_inventory_user", columnList = "user_id"),
                @Index(name = "idx_inventory_category", columnList = "category")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 20)
    private InventoryCategory category;

    /** واحد شمارش — مثل عدد، کیلوگرم، لیتر، بسته */
    @Column(name = "unit", nullable = false, length = 20)
    private String unit;

    @Column(name = "quantity", nullable = false, precision = 15, scale = 2)
    private BigDecimal quantity;

    /** حداقل موجودی — برای هشدار کمبود */
    @Column(name = "min_quantity", nullable = false, precision = 15, scale = 2)
    private BigDecimal minQuantity;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (quantity == null) quantity = BigDecimal.ZERO;
        if (minQuantity == null) minQuantity = BigDecimal.ZERO;
        if (unit == null || unit.isBlank()) unit = "عدد";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
