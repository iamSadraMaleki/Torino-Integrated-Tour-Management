package com.example.project.discount.services;

import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.ceo_tour.tour.repository.TourRepository;
import com.example.project.discount.dto.DiscountCodeDto;
import com.example.project.discount.dto.DiscountCodeRequest;
import com.example.project.discount.dto.TourSpecialDiscountDto;
import com.example.project.discount.dto.TourSpecialDiscountRequest;
import com.example.project.discount.model.DiscountCode;
import com.example.project.discount.model.TourSpecialDiscount;
import com.example.project.discount.repository.DiscountCodeRepository;
import com.example.project.discount.repository.TourSpecialDiscountRepository;
import com.example.project.inbox.model.InboxMessageType;
import com.example.project.inbox.services.InboxService;
import com.example.project.users.Repasitory.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiscountServiceImpl implements DiscountService {

    private final TourSpecialDiscountRepository specialRepository;
    private final DiscountCodeRepository codeRepository;
    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final InboxService inboxService;

    // ============ تور ویژه ============

    @Override
    @Transactional
    public TourSpecialDiscountDto createSpecial(String ceoUsername, TourSpecialDiscountRequest request) {
        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "تور یافت نشد"));

        if (tour.getCreatedBy() == null || !ceoUsername.equalsIgnoreCase(tour.getCreatedBy().getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "این تور متعلق به شما نیست");
        }

        if (request.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "زمان انقضا باید در آینده باشد");
        }

        if (specialRepository.existsByTourIdAndIsActiveTrueAndExpiresAtAfter(
                tour.getId(), LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "این تور در حال حاضر تخفیف ویژه فعال دارد");
        }

        TourSpecialDiscount discount = TourSpecialDiscount.builder()
                .tour(tour)
                .discountPercent(request.getDiscountPercent())
                .startsAt(LocalDateTime.now())
                .expiresAt(request.getExpiresAt())
                .isActive(true)
                .createdByUsername(ceoUsername)
                .build();
        discount = specialRepository.save(discount);
        log.info("Special discount {} created on tour {} by {}", discount.getId(), tour.getId(), ceoUsername);
        return toSpecialDto(discount);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourSpecialDiscountDto> getActiveSpecials() {
        return specialRepository.findActiveAndNotExpired(LocalDateTime.now())
                .stream()
                .map(this::toSpecialDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourSpecialDiscountDto> getCeoSpecials(String ceoUsername) {
        return specialRepository.findByTourCreatedByUsernameOrderByCreatedAtDesc(ceoUsername)
                .stream()
                .map(this::toSpecialDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourSpecialDiscountDto> getAllSpecials() {
        return specialRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .map(this::toSpecialDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TourSpecialDiscountDto toggleSpecial(Long id, boolean active) {
        TourSpecialDiscount discount = requireSpecial(id);
        discount.setIsActive(active);
        discount = specialRepository.save(discount);
        return toSpecialDto(discount);
    }

    @Override
    @Transactional
    public void deleteSpecial(Long id) {
        requireSpecial(id);
        specialRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getEffectiveUnitPrice(Tour tour) {
        Integer percent = getActiveSpecialPercent(tour.getId());
        if (percent == null || tour.getPrice() == null) {
            return tour.getPrice();
        }
        return discounted(tour.getPrice(), percent);
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getActiveSpecialPercent(Long tourId) {
        return specialRepository.findByTourIdAndIsActiveTrueAndExpiresAtAfter(tourId, LocalDateTime.now())
                .map(TourSpecialDiscount::getDiscountPercent)
                .orElse(null);
    }

    // ============ کد تخفیف ============

    @Override
    @Transactional
    public DiscountCodeDto createCode(String creatorUsername, String role, DiscountCodeRequest request) {
        String normalizedCode = request.getCode().trim().toUpperCase(Locale.ROOT);
        if (codeRepository.findByCode(normalizedCode).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "این کد تخفیف قبلاً ساخته شده است");
        }

        DiscountCode code = DiscountCode.builder()
                .code(normalizedCode)
                .title(request.getTitle() != null ? request.getTitle().trim() : "")
                .discountPercent(request.getDiscountPercent())
                .maxUses(request.getMaxUses())
                .usedCount(0)
                .expiresAt(request.getExpiresAt())
                .isActive(true)
                .forUserUsername(request.getForUserUsername() != null && !request.getForUserUsername().isBlank()
                        ? request.getForUserUsername().trim() : null)
                .createdByUsername(creatorUsername)
                .createdByRole(role)
                .build();
        code = codeRepository.save(code);

        // اگر کد برای کاربر خاصی است → به اینباکس او ارسال کن
        if (code.getForUserUsername() != null) {
            String title = "🎟️ کد تخفیف ویژه شما";
            String content = "کد تخفیف «" + normalizedCode + "» به میزان ٪" + request.getDiscountPercent()
                    + " برای شما صادر شده است. این کد را هنگام رزرو تور وارد کنید.";
            inboxService.sendToUser(creatorUsername, role, code.getForUserUsername(),
                    InboxMessageType.ADMIN, title, content, code.getId());
        }

        log.info("Discount code {} created by {} ({})", normalizedCode, creatorUsername, role);
        return toCodeDto(code);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiscountCodeDto> getCeoCodes(String ceoUsername) {
        return codeRepository.findByCreatedByUsernameOrderByCreatedAtDesc(ceoUsername)
                .stream()
                .map(this::toCodeDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiscountCodeDto> getAllCodes() {
        return codeRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .map(this::toCodeDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DiscountCodeDto toggleCode(Long id, boolean active) {
        DiscountCode code = requireCode(id);
        code.setIsActive(active);
        code = codeRepository.save(code);
        return toCodeDto(code);
    }

    @Override
    @Transactional
    public void deleteCode(Long id) {
        requireCode(id);
        codeRepository.deleteById(id);
    }

    @Override
    @Transactional
    public BigDecimal applyCode(String codeValue, String username, BigDecimal basePrice) {
        String normalized = codeValue.trim().toUpperCase(Locale.ROOT);
        DiscountCode code = codeRepository.findByCode(normalized)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "کد تخفیف معتبر نیست"));

        if (!Boolean.TRUE.equals(code.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "این کد تخفیف غیرفعال است");
        }
        if (code.getExpiresAt() != null && code.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "این کد تخفیف منقضی شده است");
        }
        if (code.getMaxUses() != null && code.getUsedCount() >= code.getMaxUses()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "سقف استفاده از این کد تکمیل شده است");
        }
        if (code.getForUserUsername() != null && !code.getForUserUsername().equalsIgnoreCase(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "این کد تخفیف مخصوص شما نیست");
        }

        code.setUsedCount(code.getUsedCount() + 1);
        codeRepository.save(code);
        return discounted(basePrice, code.getDiscountPercent());
    }

    @Override
    @Transactional(readOnly = true)
    public Integer validateCode(String codeValue, String username) {
        String normalized = codeValue.trim().toUpperCase(Locale.ROOT);
        DiscountCode code = codeRepository.findByCode(normalized)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "کد تخفیف معتبر نیست"));

        if (!Boolean.TRUE.equals(code.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "این کد تخفیف غیرفعال است");
        }
        if (code.getExpiresAt() != null && code.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "این کد تخفیف منقضی شده است");
        }
        if (code.getMaxUses() != null && code.getUsedCount() >= code.getMaxUses()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "سقف استفاده از این کد تکمیل شده است");
        }
        if (code.getForUserUsername() != null && !code.getForUserUsername().equalsIgnoreCase(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "این کد تخفیف مخصوص شما نیست");
        }
        return code.getDiscountPercent();
    }

    // ============ helper ============

    private BigDecimal discounted(BigDecimal price, int percent) {
        BigDecimal factor = BigDecimal.ONE.subtract(
                BigDecimal.valueOf(percent).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
        return price.multiply(factor).setScale(0, RoundingMode.HALF_UP);
    }

    private TourSpecialDiscount requireSpecial(Long id) {
        return specialRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "تخفیف ویژه یافت نشد"));
    }

    private DiscountCode requireCode(Long id) {
        return codeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کد تخفیف یافت نشد"));
    }

    private TourSpecialDiscountDto toSpecialDto(TourSpecialDiscount d) {
        Tour tour = d.getTour();
        String tourName = "";
        String tourCode = "";
        if (tour.getBaseTour() != null) {
            tourName = tour.getBaseTour().getTourName() != null ? tour.getBaseTour().getTourName() : "";
            tourCode = tour.getBaseTour().getTourCode() != null ? tour.getBaseTour().getTourCode() : "";
        }
        BigDecimal original = tour.getPrice() != null ? tour.getPrice() : BigDecimal.ZERO;
        return TourSpecialDiscountDto.builder()
                .id(d.getId())
                .tourId(tour.getId())
                .tourName(tourName)
                .tourCode(tourCode)
                .originalPrice(original)
                .discountedPrice(discounted(original, d.getDiscountPercent()))
                .discountPercent(d.getDiscountPercent())
                .startsAt(d.getStartsAt())
                .expiresAt(d.getExpiresAt())
                .isActive(d.getIsActive())
                .createdByUsername(d.getCreatedByUsername())
                .createdAt(d.getCreatedAt())
                .build();
    }

    private DiscountCodeDto toCodeDto(DiscountCode c) {
        return DiscountCodeDto.builder()
                .id(c.getId())
                .code(c.getCode())
                .title(c.getTitle())
                .discountPercent(c.getDiscountPercent())
                .maxUses(c.getMaxUses())
                .usedCount(c.getUsedCount())
                .expiresAt(c.getExpiresAt())
                .isActive(c.getIsActive())
                .forUserUsername(c.getForUserUsername())
                .createdByUsername(c.getCreatedByUsername())
                .createdByRole(c.getCreatedByRole())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
