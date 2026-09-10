package com.example.project.ceo_food.shopping.model;

import com.example.project.users.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * لیست خرید — اقلامی که مدیر آژانس باید تهیه کند (با وضعیت و تاریخچه خرید)
 */
@Entity
@Table(name = "shopping_items",
        indexes = {
                @Index(name = "idx_shopping_user", columnList = "user_id"),
                @Index(name = "idx_shopping_status", columnList = "status")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShoppingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "quantity", nullable = false, precision = 15, scale = 2)
    private BigDecimal quantity;

    @Column(name = "unit", nullable = false, length = 20)
    private String unit;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ShoppingStatus status;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    /** لینک اختیاری به قلم انبار — موقع خرید، موجودی انبار به‌صورت خودکار زیاد می‌شود */
    @Column(name = "inventory_item_id")
    private Long inventoryItemId;

    @Column(name = "created_by", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "purchased_at")
    private LocalDateTime purchasedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = ShoppingStatus.PENDING;
        if (quantity == null) quantity = BigDecimal.ONE;
        if (unit == null || unit.isBlank()) unit = "عدد";
    }
}
