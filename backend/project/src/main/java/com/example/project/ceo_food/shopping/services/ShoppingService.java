package com.example.project.ceo_food.shopping.services;

import com.example.project.ceo_food.shopping.dto.ShoppingItemRequest;
import com.example.project.ceo_food.shopping.dto.ShoppingItemResponse;
import com.example.project.ceo_food.shopping.dto.ShoppingStatsResponse;

import java.util.List;

public interface ShoppingService {

    ShoppingItemResponse create(String ceoUsername, ShoppingItemRequest request);

    ShoppingItemResponse update(String ceoUsername, Long itemId, ShoppingItemRequest request);

    List<ShoppingItemResponse> getAll(String ceoUsername);

    /** علامت‌گذاری به‌عنوان خریداری‌شده — در صورت لینک به انبار، موجودی خودکار زیاد می‌شود */
    ShoppingItemResponse markPurchased(String ceoUsername, Long itemId);

    ShoppingItemResponse cancel(String ceoUsername, Long itemId);

    void delete(String ceoUsername, Long itemId);

    ShoppingStatsResponse getStatistics(String ceoUsername);
}
