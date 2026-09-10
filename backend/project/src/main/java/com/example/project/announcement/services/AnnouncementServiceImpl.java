package com.example.project.announcement.services;

import com.example.project.announcement.dto.AnnouncementCreateRequest;
import com.example.project.announcement.dto.AnnouncementResponse;
import com.example.project.announcement.model.Announcement;
import com.example.project.announcement.model.AnnouncementAudience;
import com.example.project.announcement.model.AnnouncementPriority;
import com.example.project.announcement.repository.AnnouncementRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public AnnouncementResponse create(String adminUsername, AnnouncementCreateRequest request) {
        log.info("Creating announcement by admin: {}", adminUsername);

        if (request.getAudience() == AnnouncementAudience.CITY
                && (request.getTargetCity() == null || request.getTargetCity().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "برای اطلاعیه بر اساس شهر، نام شهر الزامی است");
        }
        if (request.getExpiresAt() != null && request.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "تاریخ انقضا نمی‌تواند در گذشته باشد");
        }

        Announcement announcement = Announcement.builder()
                .title(request.getTitle().trim())
                .content(request.getContent().trim())
                .priority(request.getPriority())
                .audience(request.getAudience())
                .targetCity(request.getTargetCity() != null ? request.getTargetCity().trim() : null)
                .expiresAt(request.getExpiresAt())
                .isPinned(Boolean.TRUE.equals(request.getIsPinned()))
                .isActive(true)
                .createdBy(adminUsername)
                .build();

        return toResponse(announcementRepository.save(announcement));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getAll() {
        return announcementRepository.findAllByOrderByIsPinnedDescCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getActiveForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "کاربر یافت نشد"));

        Set<String> roles = user.getRoles().stream()
                .map(r -> r.getName())
                .collect(Collectors.toSet());

        boolean isAgency = roles.contains("ROLE_CEO");
        boolean isPassenger = roles.contains("ROLE_USER");
        String userCity = user.getCity();

        LocalDateTime now = LocalDateTime.now();

        return announcementRepository.findByIsActiveTrue().stream()
                .filter(a -> a.getExpiresAt() == null || a.getExpiresAt().isAfter(now))
                .filter(a -> audienceMatches(a, isAgency, isPassenger, userCity))
                .sorted(Comparator
                        .comparing(Announcement::getIsPinned, Comparator.reverseOrder())
                        .thenComparing(Announcement::getPriority,
                                Comparator.comparingInt(this::priorityWeight).reversed())
                        .thenComparing(Announcement::getCreatedAt, Comparator.reverseOrder()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private boolean audienceMatches(Announcement a, boolean isAgency, boolean isPassenger, String userCity) {
        return switch (a.getAudience()) {
            case ALL -> true;
            case AGENCIES -> isAgency;
            case PASSENGERS -> isPassenger;
            case CITY -> userCity != null
                    && a.getTargetCity() != null
                    && userCity.trim().equalsIgnoreCase(a.getTargetCity().trim());
        };
    }

    private int priorityWeight(AnnouncementPriority p) {
        return switch (p) {
            case CRITICAL -> 4;
            case HIGH -> 3;
            case MEDIUM -> 2;
            case LOW -> 1;
        };
    }

    @Override
    @Transactional
    public AnnouncementResponse togglePin(Long id) {
        Announcement a = findById(id);
        a.setIsPinned(!Boolean.TRUE.equals(a.getIsPinned()));
        return toResponse(announcementRepository.save(a));
    }

    @Override
    @Transactional
    public AnnouncementResponse toggleActive(Long id) {
        Announcement a = findById(id);
        a.setIsActive(!Boolean.TRUE.equals(a.getIsActive()));
        return toResponse(announcementRepository.save(a));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Announcement a = findById(id);
        announcementRepository.delete(a);
        log.info("Announcement {} deleted", id);
    }

    private Announcement findById(Long id) {
        return announcementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "اطلاعیه یافت نشد"));
    }

    private AnnouncementResponse toResponse(Announcement a) {
        boolean expired = a.getExpiresAt() != null && a.getExpiresAt().isBefore(LocalDateTime.now());
        return AnnouncementResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .content(a.getContent())
                .priority(a.getPriority())
                .priorityPersian(a.getPriority().getPersianName())
                .audience(a.getAudience())
                .audiencePersian(a.getAudience().getPersianName())
                .targetCity(a.getTargetCity())
                .expiresAt(a.getExpiresAt())
                .isPinned(a.getIsPinned())
                .isActive(a.getIsActive())
                .createdBy(a.getCreatedBy())
                .createdAt(a.getCreatedAt())
                .isExpired(expired)
                .build();
    }
}
