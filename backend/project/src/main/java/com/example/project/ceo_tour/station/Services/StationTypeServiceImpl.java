package com.example.project.ceo_tour.station.Services;

import com.example.project.ceo_tour.station.Repository.StationTypeRepository;
import com.example.project.ceo_tour.station.dto.StationTypeCreateRequest;
import com.example.project.ceo_tour.station.dto.StationTypeDto;
import com.example.project.ceo_tour.station.dto.StationTypeUpdateRequest;
import com.example.project.ceo_tour.station.model.StationType;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StationTypeServiceImpl implements StationTypeService {

    private final StationTypeRepository stationTypeRepository;
    private final UserRepository userRepository;

    private User requireUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @Override
    @Transactional
    public StationTypeDto create(String username, StationTypeCreateRequest request) {
        String typeName = request.getTypeName().trim();

        if (stationTypeRepository.existsByCreatedByUsernameAndTypeNameIgnoreCase(username, typeName)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Station type already exists");
        }

        User ceo = requireUser(username);

        StationType type = StationType.builder()
                .createdBy(ceo)
                .typeName(typeName)
                .build();

        StationType saved = stationTypeRepository.save(type);
        return StationTypeDto.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StationTypeDto> getMyTypes(String username) {
        return stationTypeRepository.findAllByCreatedByUsernameOrderByTypeNameAsc(username)
                .stream()
                .map(StationTypeDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StationTypeDto getById(String username, Long id) {
        StationType type = stationTypeRepository.findByIdAndCreatedByUsername(id, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Station type not found"));
        return StationTypeDto.fromEntity(type);
    }

    @Override
    @Transactional
    public StationTypeDto update(String username, Long id, StationTypeUpdateRequest request) {
        StationType type = stationTypeRepository.findByIdAndCreatedByUsername(id, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Station type not found"));

        String newName = request.getTypeName().trim();

        if (!type.getTypeName().equalsIgnoreCase(newName)
                && stationTypeRepository.existsByCreatedByUsernameAndTypeNameIgnoreCase(username, newName)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Station type already exists");
        }

        type.setTypeName(newName);
        StationType saved = stationTypeRepository.save(type);
        return StationTypeDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public void delete(String username, Long id) {
        StationType type = stationTypeRepository.findByIdAndCreatedByUsername(id, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Station type not found"));

        stationTypeRepository.delete(type);
    }
}
