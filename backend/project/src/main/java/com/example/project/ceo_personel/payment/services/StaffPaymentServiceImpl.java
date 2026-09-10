package com.example.project.ceo_personel.payment.services;

import com.example.project.ceo_personel.model.StaffMember;
import com.example.project.ceo_personel.payment.dto.StaffPaymentRequest;
import com.example.project.ceo_personel.payment.dto.StaffPaymentResponse;
import com.example.project.ceo_personel.payment.dto.StaffPaymentStatsResponse;
import com.example.project.ceo_personel.payment.model.StaffPayment;
import com.example.project.ceo_personel.payment.model.StaffPaymentType;
import com.example.project.ceo_personel.payment.repository.StaffPaymentRepository;
import com.example.project.ceo_personel.repository.StaffMemberRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StaffPaymentServiceImpl implements StaffPaymentService {

    private final StaffPaymentRepository paymentRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public StaffPaymentResponse recordPayment(String ceoUsername, StaffPaymentRequest request) {
        User user = findUser(ceoUsername);

        StaffMember staff = staffMemberRepository.findByIdAndUserId(request.getStaffMemberId(), user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "کارمند مورد نظر پیدا نشد یا متعلق به شما نیست"));

        StaffPaymentType type;
        try {
            type = StaffPaymentType.valueOf(request.getPaymentType() != null
                    ? request.getPaymentType().trim().toUpperCase() : "");
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "نوع پرداخت نامعتبر است — باید SALARY یا BONUS باشد");
        }

        StaffPayment payment = StaffPayment.builder()
                .staffMember(staff)
                .amount(request.getAmount())
                .paymentType(type)
                .title(request.getTitle().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .paymentDate(request.getPaymentDate())
                .createdBy(ceoUsername)
                .build();

        payment = paymentRepository.save(payment);
        log.info("Payment {} ({} - {}) recorded by {} for staff {}",
                payment.getId(), type, payment.getAmount(), ceoUsername, staff.getFullName());

        return toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffPaymentResponse> getPayments(String ceoUsername) {
        User user = findUser(ceoUsername);
        return paymentRepository.findAllByUserId(user.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffPaymentResponse> getPaymentsByStaff(String ceoUsername, Long staffId) {
        User user = findUser(ceoUsername);
        staffMemberRepository.findByIdAndUserId(staffId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "کارمند مورد نظر پیدا نشد یا متعلق به شما نیست"));
        return paymentRepository.findByStaffIdAndUserId(staffId, user.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public StaffPaymentStatsResponse getStatistics(String ceoUsername) {
        User user = findUser(ceoUsername);
        Long userId = user.getId();

        BigDecimal totalPaid = paymentRepository.sumByUserId(userId);
        BigDecimal totalSalary = paymentRepository.sumByUserIdAndType(userId, StaffPaymentType.SALARY);
        BigDecimal totalBonus = paymentRepository.sumByUserIdAndType(userId, StaffPaymentType.BONUS);

        List<StaffPayment> all = paymentRepository.findAllByUserId(userId);
        long paymentCount = all.size();
        long salaryCount = all.stream().filter(p -> p.getPaymentType() == StaffPaymentType.SALARY).count();
        long bonusCount = paymentCount - salaryCount;

        // مجموع هر کارمند
        Map<Long, BigDecimal> totalByStaff = new HashMap<>();
        Map<Long, BigDecimal> salaryByStaff = new HashMap<>();
        Map<Long, BigDecimal> bonusByStaff = new HashMap<>();
        Map<Long, Long> countByStaff = new HashMap<>();
        Map<Long, String> nameByStaff = new HashMap<>();
        for (StaffPayment p : all) {
            Long sid = p.getStaffMember().getId();
            totalByStaff.merge(sid, p.getAmount(), BigDecimal::add);
            if (p.getPaymentType() == StaffPaymentType.SALARY) {
                salaryByStaff.merge(sid, p.getAmount(), BigDecimal::add);
            } else {
                bonusByStaff.merge(sid, p.getAmount(), BigDecimal::add);
            }
            countByStaff.merge(sid, 1L, Long::sum);
            nameByStaff.put(sid, p.getStaffMember().getFullName());
        }

        List<StaffPaymentStatsResponse.PerStaff> perStaff = nameByStaff.entrySet().stream()
                .map(e -> StaffPaymentStatsResponse.PerStaff.builder()
                        .staffMemberId(e.getKey())
                        .staffName(e.getValue())
                        .total(totalByStaff.getOrDefault(e.getKey(), BigDecimal.ZERO))
                        .salaryTotal(salaryByStaff.getOrDefault(e.getKey(), BigDecimal.ZERO))
                        .bonusTotal(bonusByStaff.getOrDefault(e.getKey(), BigDecimal.ZERO))
                        .paymentCount(countByStaff.getOrDefault(e.getKey(), 0L))
                        .build())
                .sorted((a, b) -> b.getTotal().compareTo(a.getTotal()))
                .collect(Collectors.toList());

        // به تفکیک ماه
        List<StaffPaymentStatsResponse.PerMonth> perMonth = new ArrayList<>();
        for (Object[] row : paymentRepository.sumByMonth(userId)) {
            perMonth.add(StaffPaymentStatsResponse.PerMonth.builder()
                    .month(String.valueOf(row[0]))
                    .total((BigDecimal) row[1])
                    .paymentCount(((Number) row[2]).longValue())
                    .build());
        }

        return StaffPaymentStatsResponse.builder()
                .totalPaid(totalPaid)
                .totalSalary(totalSalary)
                .totalBonus(totalBonus)
                .paymentCount(paymentCount)
                .salaryCount(salaryCount)
                .bonusCount(bonusCount)
                .perStaff(perStaff)
                .perMonth(perMonth)
                .build();
    }

    @Override
    @Transactional
    public void deletePayment(String ceoUsername, Long paymentId) {
        User user = findUser(ceoUsername);
        StaffPayment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "پرداخت یافت نشد"));

        if (!payment.getStaffMember().getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "شما اجازه حذف این پرداخت را ندارید");
        }
        paymentRepository.delete(payment);
        log.info("Payment {} deleted by {}", paymentId, ceoUsername);
    }

    // ===================== helper ها =====================

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "کاربر یافت نشد"));
    }

    private String typePersian(StaffPaymentType type) {
        return type == StaffPaymentType.SALARY ? "حقوق" : "پاداش";
    }

    private StaffPaymentResponse toResponse(StaffPayment p) {
        String positionTitle = p.getStaffMember().getPosition() != null
                ? p.getStaffMember().getPosition().getTitle() : "";
        return StaffPaymentResponse.builder()
                .id(p.getId())
                .staffMemberId(p.getStaffMember().getId())
                .staffName(p.getStaffMember().getFullName())
                .positionTitle(positionTitle)
                .amount(p.getAmount())
                .paymentType(p.getPaymentType().name())
                .paymentTypePersian(typePersian(p.getPaymentType()))
                .title(p.getTitle())
                .description(p.getDescription())
                .paymentDate(p.getPaymentDate())
                .createdBy(p.getCreatedBy())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
