package com.example.project.ceo_personel.services;



import com.example.project.ceo_personel.dto.PositionDto;
import com.example.project.ceo_personel.dto.PositionRequest;

import java.util.List;

public interface PositionService {

    PositionDto createPosition(String username, PositionRequest request);

    PositionDto updatePosition(String username, Long positionId, PositionRequest request);

    void deletePosition(String username, Long positionId);

    PositionDto getPositionById(String username, Long positionId);

    List<PositionDto> getAllPositions(String username);

    List<PositionDto> getActivePositions(String username);

}

