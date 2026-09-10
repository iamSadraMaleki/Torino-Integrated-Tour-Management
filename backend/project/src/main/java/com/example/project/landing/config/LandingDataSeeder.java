package com.example.project.landing.config;

import com.example.project.landing.model.LandingContent;
import com.example.project.landing.repository.LandingContentRepository;
import com.example.project.landing.services.LandingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * هنگام استارت‌آپ، اگر جدول محتوای صفحه معرفی خالی باشد، داده‌های اولیه
 * (از resources/landing-defaults.json) وارد دیتابیس می‌شود.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LandingDataSeeder implements ApplicationRunner {

    private final LandingContentRepository repository;
    private final LandingService landingService;

    private static final List<String> KEYS = List.of(
            LandingService.KEY_HERO,
            LandingService.KEY_CITIES,
            LandingService.KEY_PLACES,
            LandingService.KEY_HOTELS,
            LandingService.KEY_FOODS,
            LandingService.KEY_VEHICLES
    );

    @Override
    public void run(ApplicationArguments args) {
        try {
            if (repository.count() > 0) {
                log.info("Landing content already seeded ({} rows) — skipping", repository.count());
                return;
            }
            for (String key : KEYS) {
                LandingContent content = LandingContent.builder()
                        .contentKey(key)
                        .contentValue(landingService.getDefaultValue(key))
                        .build();
                repository.save(content);
            }
            log.info("✅ Landing content seeded with default values ({} keys)", KEYS.size());
        } catch (Exception e) {
            log.warn("Skipped landing content seeding: {}", e.getMessage());
        }
    }
}
