package com.example.project.ceo_food.inventory.services;

import com.example.project.ceo_food.inventory.dto.InventoryItemRequest;
import com.example.project.ceo_food.inventory.dto.InventoryItemResponse;
import com.example.project.ceo_food.inventory.dto.InventoryStatsResponse;

import java.math.BigDecimal;
import java.util.List;

public interface InventoryService {

    InventoryItemResponse create(String ceoUsername, InventoryItemRequest request);

    InventoryItemResponse update(String ceoUsername, Long itemId, InventoryItemRequest request);

    void delete(String ceoUsername, Long itemId);

    InventoryItemResponse getById(String ceoUsername, Long itemId);

    List<InventoryItemResponse> getAll(String ceoUsername);

    /** تغییر موجودی با مقدار دلتا (مثبت = اضافه، منفی = کم) */
    InventoryItemResponse adjustQuantity(String ceoUsername, Long itemId, BigDecimal delta);

    InventoryStatsResponse getStatistics(String ceoUsername);
}
