package com.example.project.ceo_car_seat.services;



import com.example.project.ceo_car_seat.dto.SeatArrangementDto;
import com.example.project.ceo_car_seat.dto.SeatArrangementMapper;
import com.example.project.ceo_car_seat.dto.SeatArrangementRequest;
import com.example.project.ceo_car_seat.model.SeatArrangement;
import com.example.project.ceo_car_seat.repository.SeatArrangementRepository;
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
public class SeatArrangementServiceImpl implements SeatArrangementService {

    private final SeatArrangementRepository arrangementRepository;
    private final UserRepository userRepository;
    private final SeatArrangementMapper arrangementMapper;
    private static final Logger logger = LoggerFactory.getLogger(SeatArrangementServiceImpl.class);

    @Override
    @Transactional
    public SeatArrangementDto createArrangement(String username, SeatArrangementRequest request) {
        logger.info("Creating seat arrangement for CEO {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        // اگه isDefault true باشه، بقیه رو false می‌کنیم
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            arrangementRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                    .forEach(arr -> {
                        arr.setIsDefault(false);
                        arrangementRepository.save(arr);
                    });
        }

        SeatArrangement arrangement = SeatArrangement.builder()
                .user(user)
                .pattern(request.getPattern())
                .name(request.getName())
                .description(request.getDescription())
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .build();

        SeatArrangement saved = arrangementRepository.save(arrangement);
        logger.info("Seat arrangement created successfully with id: {}", saved.getId());

        return arrangementMapper.toDto(saved);
    }

    @Override
    @Transactional
    public SeatArrangementDto updateArrangement(String username, Long arrangementId, SeatArrangementRequest request) {
        logger.info("Updating seat arrangement {} by CEO {}", arrangementId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        SeatArrangement arrangement = arrangementRepository.findByIdAndUserId(arrangementId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "الگوی چینش پیدا نشد"));

        // اگه isDefault true باشه، بقیه رو false می‌کنیم
        if (Boolean.TRUE.equals(request.getIsDefault()) && !arrangement.getIsDefault()) {
            arrangementRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                    .forEach(arr -> {
                        if (!arr.getId().equals(arrangementId)) {
                            arr.setIsDefault(false);
                            arrangementRepository.save(arr);
                        }
                    });
        }

        arrangement.setPattern(request.getPattern());
        arrangement.setName(request.getName());
        arrangement.setDescription(request.getDescription());
        if (request.getIsDefault() != null) {
            arrangement.setIsDefault(request.getIsDefault());
        }

        SeatArrangement updated = arrangementRepository.save(arrangement);
        logger.info("Seat arrangement updated successfully");

        return arrangementMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void deleteArrangement(String username, Long arrangementId) {
        logger.info("Deleting seat arrangement {} by CEO {}", arrangementId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        SeatArrangement arrangement = arrangementRepository.findByIdAndUserId(arrangementId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "الگوی چینش پیدا نشد"));

        arrangementRepository.delete(arrangement);
        logger.info("Seat arrangement deleted successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public SeatArrangementDto getArrangement(String username, Long arrangementId) {
        logger.info("Fetching seat arrangement {} by CEO {}", arrangementId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        SeatArrangement arrangement = arrangementRepository.findByIdAndUserId(arrangementId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "الگوی چینش پیدا نشد"));

        return arrangementMapper.toDto(arrangement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatArrangementDto> getAllArrangements(String username) {
        logger.info("Fetching all seat arrangements by CEO {}", username);

        return arrangementRepository.findByUsername(username)
                .stream()
                .map(arrangementMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SeatArrangementDto getDefaultArrangement(String username) {
        logger.info("Fetching default seat arrangement by CEO {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        SeatArrangement arrangement = arrangementRepository.findDefaultByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "الگوی پیش‌فرض پیدا نشد. لطفاً یک الگو را به عنوان پیش‌فرض تنظیم کنید"));

        return arrangementMapper.toDto(arrangement);
    }

    @Override
    @Transactional
    public SeatArrangementDto setDefaultArrangement(String username, Long arrangementId) {
        logger.info("Setting arrangement {} as default by CEO {}", arrangementId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        // همه رو false می‌کنیم
        arrangementRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .forEach(arr -> {
                    arr.setIsDefault(false);
                    arrangementRepository.save(arr);
                });

        // این یکی رو true می‌کنیم
        SeatArrangement arrangement = arrangementRepository.findByIdAndUserId(arrangementId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "الگوی چینش پیدا نشد"));

        arrangement.setIsDefault(true);
        SeatArrangement updated = arrangementRepository.save(arrangement);

        logger.info("Arrangement set as default successfully");
        return arrangementMapper.toDto(updated);
    }
}
