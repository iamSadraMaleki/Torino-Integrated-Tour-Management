package com.example.project.wishlist.services;

import com.example.project.wishlist.dto.WishlistItemDto;

import java.util.List;

public interface WishlistService {

    List<WishlistItemDto> getMyWishlist(Long userId);

    WishlistItemDto add(Long userId, Long tourId);

    void remove(Long userId, Long tourId);

    boolean isInWishlist(Long userId, Long tourId);
}
