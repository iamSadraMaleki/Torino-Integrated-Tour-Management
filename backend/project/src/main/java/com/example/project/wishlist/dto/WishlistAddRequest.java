package com.example.project.wishlist.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WishlistAddRequest {

    @NotNull(message = "شناسه تور الزامی است")
    private Long tourId;
}
