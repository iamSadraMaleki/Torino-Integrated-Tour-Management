package com.example.project.landing.services;

import com.example.project.landing.model.LandingContent;
import com.example.project.landing.repository.LandingContentRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class LandingServiceImpl implements LandingService {

    private final LandingContentRepository repository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public Map<String, String> getContent() {
        Map<String, String> result = new LinkedHashMap<>();
        repository.findAll().forEach(c -> result.put(c.getContentKey(), c.getContentValue()));

        // اگر کلیدی وجود نداشت (مثلاً قبل از سی‌دینگ)، مقدار پیش‌فرض برگردان تا صفحه خالی نماند
        for (String key : new String[]{KEY_HERO, KEY_CITIES, KEY_PLACES, KEY_HOTELS, KEY_FOODS, KEY_VEHICLES}) {
            result.putIfAbsent(key, getDefaultValue(key));
        }
        return result;
    }

    @Override
    @Transactional
    public Map<String, String> updateContent(Map<String, String> content) {
        if (content == null || content.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "محتوایی برای به‌روزرسانی ارسال نشده است");
        }
        for (Map.Entry<String, String> entry : content.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if (key == null || key.isBlank() || value == null || value.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "کلید یا مقدار نمی‌تواند خالی باشد: " + key);
            }
            // اعتبارسنجی JSON بودن مقدار (مگر اینکه متن ساده باشد — همه کلیدهای ما JSON هستند)
            try {
                objectMapper.readTree(value);
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "مقدار کلید «" + key + "» باید یک JSON معتبر باشد");
            }
            upsert(key, value);
        }
        log.info("Landing content updated for keys: {}", content.keySet());
        return getContent();
    }

    @Override
    @Transactional
    public Map<String, String> restoreDefaults() {
        for (String key : new String[]{KEY_HERO, KEY_CITIES, KEY_PLACES, KEY_HOTELS, KEY_FOODS, KEY_VEHICLES}) {
            upsert(key, getDefaultValue(key));
        }
        log.info("Landing content restored to defaults");
        return getContent();
    }

    @Override
    public String getDefaultValue(String key) {
        try {
            InputStream in = new ClassPathResource("landing-defaults.json").getInputStream();
            String json = new String(in.readAllBytes(), StandardCharsets.UTF_8);
            Map<String, String> defaults = objectMapper.readValue(json, new TypeReference<Map<String, String>>() {});
            String value = defaults.get(key);
            if (value == null) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "مقدار پیش‌فرض برای کلید «" + key + "» تعریف نشده است");
            }
            return value;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to read landing-defaults.json", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "خطا در خواندن مقادیر پیش‌فرض صفحه معرفی");
        }
    }

    private void upsert(String key, String value) {
        LandingContent content = repository.findByContentKey(key)
                .orElseGet(() -> LandingContent.builder().contentKey(key).build());
        content.setContentValue(value);
        repository.save(content);
    }
}
