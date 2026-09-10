package com.example.project.wishlist.repository;

import com.example.project.wishlist.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserIdAndTourId(Long userId, Long tourId);

    Optional<WishlistItem> findByUserIdAndTourId(Long userId, Long tourId);

    void deleteByUserIdAndTourId(Long userId, Long tourId);
}
