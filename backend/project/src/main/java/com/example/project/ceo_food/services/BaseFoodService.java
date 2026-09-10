package com.example.project.ceo_food.services;

import com.example.project.ceo_food.dto.BaseFoodDto;
import com.example.project.ceo_food.dto.CreateBaseFoodRequest;

import java.util.List;

public interface BaseFoodService {

    BaseFoodDto create(CreateBaseFoodRequest request);

    BaseFoodDto update(Long id, CreateBaseFoodRequest request);

    void delete(Long id);

    List<BaseFoodDto> getMyFoods();

    BaseFoodDto getById(Long id);
}
