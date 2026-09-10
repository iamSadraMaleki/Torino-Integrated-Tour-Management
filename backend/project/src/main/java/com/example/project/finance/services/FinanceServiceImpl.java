package com.example.project.finance.services;

import com.example.project.finance.dto.*;
import com.example.project.finance.model.CommissionConfig;
import com.example.project.finance.model.SettlementRequest;
import com.example.project.finance.model.SettlementStatus;
import com.example.project.finance.repository.CommissionConfigRepository;
import com.example.project.finance.repository.SettlementRequestRepository;
import com.example.project.profile.verification.model.CeoVerification;
import com.example.project.profile.verification.repository.CeoVerificationRepository;
import com.example.project.user_reservation.model.PaymentProof;
import com.example.project.user_reservation.model.Reservation;
import com.example.project.user_reservation.model.ReservationStatus;
import com.example.project.user_reservation.repository.PaymentProofRepository;
import com.example.project.user_reservation.repository.ReservationRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanceServiceImpl implements FinanceService {

    private final ReservationRepository reservationRepository;
    private final PaymentProofRepository paymentProofRepository;
    private final UserRepository userRepository;
    private final CeoVerificationRepository verificationRepository;
    private final CommissionConfigRepository commissionConfigRepository;
    private final SettlementRequestRepository settlementRequestRepository;

    /** کمیسیون پیش‌فرض پلتفرم وقتی برای آژانسی تنظیم خاصی نشده باشد */
    private static final int DEFAULT_COMMISSION_PERCENT = 10;

    // ============ ابزارها ============

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));
    }

    private String agencyName(String username) {
        return verificationRepository.findByUsername(username)
                .map(CeoVerification::getAgencyName)
                .filter(n -> n != null && !n.isBlank())
                .orElse(username);
    }

    private int commissionPercentOf(User agency) {
        return commissionConfigRepository.findByAgencyId(agency.getId())
                .map(CommissionConfig::getCommissionPercent)
                .orElse(DEFAULT_COMMISSION_PERCENT);
    }

    private BigDecimal percentOf(BigDecimal amount, int percent) {
        return amount.multiply(BigDecimal.valueOf(percent))
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
    }

    private List<Reservation> confirmedOf(List<Reservation> list) {
        return list.stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .collect(Collectors.toList());
    }

    private BigDecimal sumAmount(List<Reservation> list) {
        return list.stream()
                .map(Reservation::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private long sumPassengers(List<Reservation> list) {
        return list.stream().mapToLong(Reservation::getPassengerCount).sum();
    }

    private BigDecimal settledNetOf(User agency) {
        BigDecimal settled = settlementRequestRepository
                .sumNetAmountByAgencyUsernameAndStatus(agency.getUsername(), SettlementStatus.APPROVED);
        return settled == null ? BigDecimal.ZERO : settled;
    }

    // ============ سوپرادمین: تراکنش‌ها ============

    @Override
    @Transactional(readOnly = true)
    public List<FinanceTransactionDto> getTransactions() {
        List<PaymentProof> proofs = paymentProofRepository.findAll();
        List<FinanceTransactionDto> result = new ArrayList<>();
        for (PaymentProof pp : proofs) {
            Reservation r = pp.getReservation();
            if (r == null || r.getTour() == null || r.getTour().getCreatedBy() == null) continue;
            result.add(FinanceTransactionDto.builder()
                    .reservationId(r.getId())
                    .userUsername(r.getUser() != null ? r.getUser().getUsername() : null)
                    .userMobile(r.getUser() != null ? r.getUser().getMobile() : null)
                    .tourName(r.getTour().getBaseTour() != null ? r.getTour().getBaseTour().getTourName() : null)
                    .tourCode(r.getTour().getBaseTour() != null ? r.getTour().getBaseTour().getTourCode() : null)
                    .agencyUsername(r.getTour().getCreatedBy().getUsername())
                    .amount(r.getTotalPrice())
                    .status(r.getStatus() != null ? r.getStatus().name() : null)
                    .statusPersian(r.getStatus() != null ? r.getStatus().getPersianName() : null)
                    .confirmedAt(r.getConfirmedAt())
                    .createdAt(r.getCreatedAt())
                    .sourceCardNumber(pp.getSourceCardNumber())
                    .receiptImageUrl(pp.getReceiptImageUrl())
                    .build());
        }
        result.sort(Comparator.comparing(FinanceTransactionDto::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return result;
    }

    // ============ سوپرادمین: درآمد آژانس‌ها ============

    @Override
    @Transactional(readOnly = true)
    public List<AgencyRevenueDto> getAgencyRevenueReport() {
        List<User> agencies = userRepository.findByRoles_Name("ROLE_CEO");
        List<AgencyRevenueDto> result = new ArrayList<>();
        for (User agency : agencies) {
            List<Reservation> confirmed = confirmedOf(
                    reservationRepository.findAllByTourCreatedByUsername(agency.getUsername()));
            BigDecimal revenue = sumAmount(confirmed);
            int percent = commissionPercentOf(agency);
            BigDecimal commission = percentOf(revenue, percent);
            BigDecimal net = revenue.subtract(commission);
            BigDecimal settled = settledNetOf(agency);
            BigDecimal available = net.subtract(settled).max(BigDecimal.ZERO);

            result.add(AgencyRevenueDto.builder()
                    .agencyId(agency.getId())
                    .agencyUsername(agency.getUsername())
                    .agencyName(agencyName(agency.getUsername()))
                    .totalRevenue(revenue)
                    .totalReservations(confirmed.size())
                    .totalPassengers(sumPassengers(confirmed))
                    .commissionPercent(percent)
                    .commissionAmount(commission)
                    .netAmount(net)
                    .settledAmount(settled)
                    .availableAmount(available)
                    .build());
        }
        result.sort(Comparator.comparing(AgencyRevenueDto::getTotalRevenue).reversed());
        return result;
    }

    // ============ سوپرادمین: خلاصه مالی ============

    @Override
    @Transactional(readOnly = true)
    public FinanceSummaryDto getFinanceSummary() {
        List<PaymentProof> proofs = paymentProofRepository.findAll();
        long totalTransactions = proofs.size();

        List<AgencyRevenueDto> report = getAgencyRevenueReport();
        BigDecimal totalAmount = report.stream()
                .map(AgencyRevenueDto::getTotalRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCommission = report.stream()
                .map(AgencyRevenueDto::getCommissionAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return FinanceSummaryDto.builder()
                .totalTransactions(totalTransactions)
                .totalAmount(totalAmount)
                .totalCommission(totalCommission)
                .pendingSettlements(settlementRequestRepository.countByStatus(SettlementStatus.PENDING))
                .approvedSettlements(settlementRequestRepository.countByStatus(SettlementStatus.APPROVED))
                .build();
    }

    // ============ سوپرادمین: تسویه ============

    @Override
    @Transactional(readOnly = true)
    public List<SettlementRequestDto> getAllSettlementRequests() {
        return settlementRequestRepository.findAllByOrderByRequestedAtDesc().stream()
                .map(this::toSettlementDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SettlementRequestDto approveSettlement(Long requestId, String adminUsername) {
        SettlementRequest req = settlementRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "درخواست تسویه پیدا نشد"));
        if (req.getStatus() != SettlementStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "این درخواست قبلاً پردازش شده است");
        }
        req.setStatus(SettlementStatus.APPROVED);
        req.setProcessedBy(adminUsername);
        req.setProcessedAt(LocalDateTime.now());
        return toSettlementDto(settlementRequestRepository.save(req));
    }

    @Override
    @Transactional
    public SettlementRequestDto rejectSettlement(Long requestId, String adminUsername, String reason) {
        SettlementRequest req = settlementRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "درخواست تسویه پیدا نشد"));
        if (req.getStatus() != SettlementStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "این درخواست قبلاً پردازش شده است");
        }
        req.setStatus(SettlementStatus.REJECTED);
        req.setRejectionReason(reason);
        req.setProcessedBy(adminUsername);
        req.setProcessedAt(LocalDateTime.now());
        return toSettlementDto(settlementRequestRepository.save(req));
    }

    // ============ سوپرادمین: کمیسیون ============

    @Override
    @Transactional(readOnly = true)
    public List<CommissionConfigDto> getCommissionConfigs() {
        return commissionConfigRepository.findAll().stream()
                .map(this::toCommissionDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CommissionConfigDto upsertCommission(Long agencyId, CommissionConfigRequest request, String adminUsername) {
        User agency = userRepository.findById(agencyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "آژانس پیدا نشد"));
        if (agency.getRoles().stream().noneMatch(r -> r.getName().equals("ROLE_CEO"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "کاربر انتخابی مدیر آژانس نیست");
        }
        CommissionConfig config = commissionConfigRepository.findByAgencyId(agencyId)
                .orElseGet(() -> CommissionConfig.builder().agency(agency).build());
        config.setCommissionPercent(request.getCommissionPercent());
        config.setUpdatedBy(adminUsername);
        return toCommissionDto(commissionConfigRepository.save(config));
    }

    // ============ مدیر آژانس: تسویه ============

    @Override
    @Transactional(readOnly = true)
    public CeoSettlementSummaryDto getMySettlementSummary(String username) {
        User agency = getUserByUsername(username);
        BigDecimal revenue = sumAmount(confirmedOf(reservationRepository.findAllByTourCreatedByUsername(username)));
        int percent = commissionPercentOf(agency);
        BigDecimal commission = percentOf(revenue, percent);
        BigDecimal net = revenue.subtract(commission);
        BigDecimal settled = settledNetOf(agency);
        BigDecimal available = net.subtract(settled).max(BigDecimal.ZERO);
        long pending = settlementRequestRepository.findByAgencyId(agency.getId()).stream()
                .filter(r -> r.getStatus() == SettlementStatus.PENDING)
                .count();

        return CeoSettlementSummaryDto.builder()
                .totalRevenue(revenue)
                .commissionPercent(percent)
                .commissionAmount(commission)
                .netAmount(net)
                .settledAmount(settled)
                .availableAmount(available)
                .pendingRequests(pending)
                .build();
    }

    @Override
    @Transactional
    public SettlementRequestDto createSettlementRequest(String username, SettlementRequestCreateRequest request) {
        User agency = getUserByUsername(username);
        CeoSettlementSummaryDto summary = getMySettlementSummary(username);

        BigDecimal amount = request.getAmount();
        if (amount.compareTo(summary.getAvailableAmount()) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "مبلغ درخواستی از موجودی قابل تسویه شما بیشتر است");
        }
        int percent = commissionPercentOf(agency);
        BigDecimal commission = percentOf(amount, percent);
        BigDecimal net = amount.subtract(commission);

        SettlementRequest req = SettlementRequest.builder()
                .agency(agency)
                .requestedAmount(amount)
                .commissionPercent(percent)
                .commissionAmount(commission)
                .netAmount(net)
                .status(SettlementStatus.PENDING)
                .build();
        return toSettlementDto(settlementRequestRepository.save(req));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SettlementRequestDto> getMySettlementRequests(String username) {
        return settlementRequestRepository.findByAgencyUsernameOrderByRequestedAtDesc(username).stream()
                .map(this::toSettlementDto)
                .collect(Collectors.toList());
    }

    // ============ مپینگ ============

    private SettlementRequestDto toSettlementDto(SettlementRequest req) {
        return SettlementRequestDto.builder()
                .id(req.getId())
                .agencyUsername(req.getAgency() != null ? req.getAgency().getUsername() : null)
                .agencyName(req.getAgency() != null ? agencyName(req.getAgency().getUsername()) : null)
                .requestedAmount(req.getRequestedAmount())
                .commissionPercent(req.getCommissionPercent())
                .commissionAmount(req.getCommissionAmount())
                .netAmount(req.getNetAmount())
                .status(req.getStatus() != null ? req.getStatus().name() : null)
                .statusPersian(req.getStatus() != null ? req.getStatus().getPersianName() : null)
                .rejectionReason(req.getRejectionReason())
                .processedBy(req.getProcessedBy())
                .requestedAt(req.getRequestedAt())
                .processedAt(req.getProcessedAt())
                .build();
    }

    private CommissionConfigDto toCommissionDto(CommissionConfig config) {
        User agency = config.getAgency();
        return CommissionConfigDto.builder()
                .id(config.getId())
                .agencyId(agency != null ? agency.getId() : null)
                .agencyUsername(agency != null ? agency.getUsername() : null)
                .agencyName(agency != null ? agencyName(agency.getUsername()) : null)
                .commissionPercent(config.getCommissionPercent())
                .updatedBy(config.getUpdatedBy())
                .updatedAt(config.getUpdatedAt())
                .build();
    }
}
