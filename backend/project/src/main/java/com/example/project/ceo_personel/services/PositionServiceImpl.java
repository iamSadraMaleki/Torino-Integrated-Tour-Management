package com.example.project.ceo_personel.services;

import com.example.project.ceo_personel.dto.PositionDto;
import com.example.project.ceo_personel.dto.PositionMapper;
import com.example.project.ceo_personel.dto.PositionRequest;
import com.example.project.ceo_personel.model.Position;
import com.example.project.ceo_personel.repository.PositionRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PositionServiceImpl implements PositionService {

    private final PositionRepository positionRepository;
    private final UserRepository userRepository;
    private final PositionMapper positionMapper;
    private static final Logger logger = LoggerFactory.getLogger(PositionServiceImpl.class);

    @Override
    @Transactional
    public PositionDto createPosition(String username, PositionRequest request) {
        logger.info("Creating position for CEO: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        Position position = Position.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        Position saved = positionRepository.save(position);
        logger.info("Position created successfully with id: {}", saved.getId());

        return positionMapper.toDto(saved);
    }

    @Override
    @Transactional
    public PositionDto updatePosition(String username, Long positionId, PositionRequest request) {
        logger.info("Updating position id: {} for CEO: {}", positionId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        Position position = positionRepository.findByIdAndUserId(positionId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "سمت پیدا نشد"));

        position.setTitle(request.getTitle());
        position.setDescription(request.getDescription());
        if (request.getIsActive() != null) {
            position.setIsActive(request.getIsActive());
        }

        Position updated = positionRepository.save(position);
        logger.info("Position updated successfully");

        return positionMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void deletePosition(String username, Long positionId) {
        logger.info("Deleting position id: {} for CEO: {}", positionId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        Position position = positionRepository.findByIdAndUserId(positionId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "سمت پیدا نشد"));

        // بررسی اینکه آیا کارمندی با این سمت وجود دارد یا نه
        long staffCount = positionMapper.toDto(position).getStaffCount();
        if (staffCount > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "این سمت دارای " + staffCount + " کارمند است و نمی‌توان آن را حذف کرد");
        }

        positionRepository.delete(position);
        logger.info("Position deleted successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public PositionDto getPositionById(String username, Long positionId) {
        logger.info("Fetching position id: {} for CEO: {}", positionId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        Position position = positionRepository.findByIdAndUserId(positionId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "سمت پیدا نشد"));

        return positionMapper.toDto(position);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PositionDto> getAllPositions(String username) {
        logger.info("Fetching all positions for CEO: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        return positionRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(positionMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PositionDto> getActivePositions(String username) {
        logger.info("Fetching active positions for CEO: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        return positionRepository.findByUserIdAndIsActiveTrueOrderByTitleAsc(user.getId())
                .stream()
                .map(positionMapper::toDto)
                .collect(Collectors.toList());
    }

}

