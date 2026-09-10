package com.example.project.wishlist.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.users.config.SecurityUtils;
import com.example.project.wishlist.dto.WishlistAddRequest;
import com.example.project.wishlist.dto.WishlistItemDto;
import com.example.project.wishlist.services.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/user/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final SecurityUtils securityUtils;

    /** لیست تورهای مورد علاقه من */
    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistItemDto>>> getMyWishlist() {
        List<WishlistItemDto> data = wishlistService.getMyWishlist(securityUtils.currentUserId());
        return ResponseEntity.ok(ApiResponse.ok("لیست تورهای مورد علاقه", data));
    }

    /** بررسی اینکه تور در لیست مورد علاقه هست یا نه */
    @GetMapping("/check/{tourId}")
    public ResponseEntity<ApiResponse<Boolean>> isInWishlist(@PathVariable Long tourId) {
        boolean data = wishlistService.isInWishlist(securityUtils.currentUserId(), tourId);
        return ResponseEntity.ok(ApiResponse.ok("وضعیت مورد علاقه", data));
    }

    /** افزودن تور به لیست مورد علاقه */
    @PostMapping
    public ResponseEntity<ApiResponse<WishlistItemDto>> add(@Valid @RequestBody WishlistAddRequest request) {
        WishlistItemDto data = wishlistService.add(securityUtils.currentUserId(), request.getTourId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("به لیست مورد علاقه اضافه شد", data));
    }

    /** حذف تور از لیست مورد علاقه */
    @DeleteMapping("/{tourId}")
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable Long tourId) {
        wishlistService.remove(securityUtils.currentUserId(), tourId);
        return ResponseEntity.ok(ApiResponse.ok("از لیست مورد علاقه حذف شد", null));
    }
}
