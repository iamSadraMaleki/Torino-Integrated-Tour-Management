package com.example.project.analytics.services;

import com.example.project.analytics.dto.AdminAnalyticsResponse;
import com.example.project.analytics.dto.CeoAnalyticsResponse;
import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.ceo_tour.tour.model.TourStatus;
import com.example.project.ceo_tour.tour.repository.TourRepository;
import com.example.project.profile.verification.model.CeoVerification;
import com.example.project.profile.verification.model.VerificationStatus;
import com.example.project.profile.verification.repository.CeoVerificationRepository;
import com.example.project.user_reservation.model.Reservation;
import com.example.project.user_reservation.model.ReservationStatus;
import com.example.project.user_reservation.repository.ReservationRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final TourRepository tourRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final CeoVerificationRepository verificationRepository;

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("MMM yy", new Locale("fa", "IR"));
    private static final DateTimeFormatter DAY_FMT = DateTimeFormatter.ofPattern("dd MMM", new Locale("fa", "IR"));

    // ===================== مدیر آژانس (CEO) =====================

    @Override
    @Transactional(readOnly = true)
    public CeoAnalyticsResponse getCeoAnalytics(String username) {
        List<Tour> tours = tourRepository.findAllByCreatedByUsernameOrderByDepartureDateDesc(username);
        List<Reservation> reservations = reservationRepository.findAllByTourCreatedByUsername(username);
        List<Reservation> confirmed = reservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .collect(Collectors.toList());

        // ── درآمد ماهانه ۶ ماه اخیر (رزروهای تأیید شده) ──
        List<CeoAnalyticsResponse.MoneyPoint> revenueByMonth = new ArrayList<>();
        YearMonth currentMonth = YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = currentMonth.minusMonths(i);
            BigDecimal amount = confirmed.stream()
                    .filter(r -> r.getConfirmedAt() != null && YearMonth.from(r.getConfirmedAt()).equals(ym))
                    .map(Reservation::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            revenueByMonth.add(CeoAnalyticsResponse.MoneyPoint.builder()
                    .label(ym.format(MONTH_FMT))
                    .amount(amount)
                    .build());
        }

        // ── درآمد روزانه ۱۴ روز اخیر (رزروهای تأیید شده) ──
        List<CeoAnalyticsResponse.MoneyPoint> revenueByDay = new ArrayList<>();
        // ── تعداد رزروهای ۱۴ روز اخیر ──
        List<CeoAnalyticsResponse.CountPoint> reservationsByDay = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 13; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            long count = reservations.stream()
                    .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().toLocalDate().equals(day))
                    .count();
            reservationsByDay.add(CeoAnalyticsResponse.CountPoint.builder()
                    .label(day.format(DAY_FMT))
                    .count(count)
                    .build());

            BigDecimal dayRevenue = confirmed.stream()
                    .filter(r -> r.getConfirmedAt() != null && r.getConfirmedAt().toLocalDate().equals(day))
                    .map(Reservation::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            revenueByDay.add(CeoAnalyticsResponse.MoneyPoint.builder()
                    .label(day.format(DAY_FMT))
                    .amount(dayRevenue)
                    .build());
        }

        // ── توزیع وضعیت رزروها ──
        List<CeoAnalyticsResponse.StatusSlice> statusDistribution = Arrays.stream(ReservationStatus.values())
                .map(s -> CeoAnalyticsResponse.StatusSlice.builder()
                        .status(s.name())
                        .persianName(s.getPersianName())
                        .count(reservations.stream().filter(r -> r.getStatus() == s).count())
                        .build())
                .collect(Collectors.toList());

        // ── پرطرفدارترین تورها (بر اساس مسافر تأیید شده) ──
        Map<Tour, List<Reservation>> byTour = confirmed.stream()
                .collect(Collectors.groupingBy(Reservation::getTour));
        List<CeoAnalyticsResponse.TopTour> topTours = byTour.entrySet().stream()
                .map(e -> {
                    Tour t = e.getKey();
                    long passengers = e.getValue().stream().mapToLong(Reservation::getPassengerCount).sum();
                    BigDecimal revenue = e.getValue().stream()
                            .map(Reservation::getTotalPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    int occ = (t.getCapacity() != null && t.getCapacity() > 0)
                            ? (int) Math.min(100, Math.round((double) passengers / t.getCapacity() * 100))
                            : 0;
                    return CeoAnalyticsResponse.TopTour.builder()
                            .tourId(t.getId())
                            .tourName(t.getBaseTour().getTourName())
                            .tourCode(t.getBaseTour().getTourCode())
                            .reservations(e.getValue().size())
                            .passengers(passengers)
                            .revenue(revenue)
                            .occupancyRate(occ)
                            .build();
                })
                .sorted(Comparator.comparingLong(CeoAnalyticsResponse.TopTour::getPassengers).reversed())
                .limit(5)
                .collect(Collectors.toList());

        // ── شاخص‌های کلیدی ──
        int activeTours = (int) tours.stream().filter(t -> t.getStatus() == TourStatus.ACTIVE).count();

        long confirmedPassengers = confirmed.stream().mapToLong(Reservation::getPassengerCount).sum();
        long totalCapacity = tours.stream()
                .filter(t -> t.getCapacity() != null && t.getCapacity() > 0)
                .mapToLong(Tour::getCapacity)
                .sum();
        int occupancyRate = totalCapacity > 0
                ? (int) Math.min(100, Math.round((double) confirmedPassengers / totalCapacity * 100))
                : 0;

        BigDecimal totalRevenue = confirmed.stream()
                .map(Reservation::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgTicketPrice = confirmed.isEmpty()
                ? BigDecimal.ZERO
                : totalRevenue.divide(BigDecimal.valueOf(confirmed.size()), 0, java.math.RoundingMode.HALF_UP);

        String bestTourName = topTours.isEmpty() ? "-" : topTours.get(0).getTourName();

        String busiestMonth = revenueByMonth.stream()
                .max(Comparator.comparing(CeoAnalyticsResponse.MoneyPoint::getAmount))
                .map(CeoAnalyticsResponse.MoneyPoint::getLabel)
                .orElse("-");

        String busiestDay = reservationsByDay.stream()
                .max(Comparator.comparingLong(CeoAnalyticsResponse.CountPoint::getCount))
                .filter(p -> p.getCount() > 0)
                .map(CeoAnalyticsResponse.CountPoint::getLabel)
                .orElse("-");

        return CeoAnalyticsResponse.builder()
                .revenueByMonth(revenueByMonth)
                .revenueByDay(revenueByDay)
                .reservationsByDay(reservationsByDay)
                .statusDistribution(statusDistribution)
                .topTours(topTours)
                .totalTours(tours.size())
                .activeTours(activeTours)
                .totalReservations(reservations.size())
                .confirmedReservations(confirmed.size())
                .totalRevenue(totalRevenue)
                .occupancyRate(occupancyRate)
                .avgTicketPrice(avgTicketPrice)
                .bestTourName(bestTourName)
                .busiestMonth(busiestMonth)
                .busiestDay(busiestDay)
                .build();
    }

    // ===================== سوپرادمین (کل پلتفرم) =====================

    @Override
    @Transactional(readOnly = true)
    public AdminAnalyticsResponse getAdminAnalytics() {
        List<Reservation> reservations = reservationRepository.findAll();
        List<Tour> tours = tourRepository.findAll();
        List<User> users = userRepository.findAll();

        // ── رزروهای ۱۴ روز اخیر ──
        List<AdminAnalyticsResponse.CountPoint> reservationsByDay = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 13; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            long count = reservations.stream()
                    .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().toLocalDate().equals(day))
                    .count();
            reservationsByDay.add(AdminAnalyticsResponse.CountPoint.builder()
                    .label(day.format(DAY_FMT))
                    .count(count)
                    .build());
        }

        // ── درآمد کل پلتفرم در ۶ ماه اخیر (رزروهای تأیید شده) ──
        List<Reservation> confirmedAll = reservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .collect(Collectors.toList());
        List<AdminAnalyticsResponse.MoneyPoint> revenueByMonth = new ArrayList<>();
        // ── تورهای ایجادشده در ۶ ماه اخیر ──
        List<AdminAnalyticsResponse.CountPoint> toursByMonth = new ArrayList<>();
        YearMonth currentMonth = YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = currentMonth.minusMonths(i);
            long count = tours.stream()
                    .filter(t -> t.getCreatedAt() != null && YearMonth.from(t.getCreatedAt()).equals(ym))
                    .count();
            toursByMonth.add(AdminAnalyticsResponse.CountPoint.builder()
                    .label(ym.format(MONTH_FMT))
                    .count(count)
                    .build());

            BigDecimal monthRevenue = confirmedAll.stream()
                    .filter(r -> r.getConfirmedAt() != null && YearMonth.from(r.getConfirmedAt()).equals(ym))
                    .map(Reservation::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            revenueByMonth.add(AdminAnalyticsResponse.MoneyPoint.builder()
                    .label(ym.format(MONTH_FMT))
                    .amount(monthRevenue)
                    .build());
        }

        // ── توزیع وضعیت رزروها ──
        List<AdminAnalyticsResponse.StatusSlice> statusDistribution = Arrays.stream(ReservationStatus.values())
                .map(s -> AdminAnalyticsResponse.StatusSlice.builder()
                        .status(s.name())
                        .persianName(s.getPersianName())
                        .count(reservations.stream().filter(r -> r.getStatus() == s).count())
                        .build())
                .collect(Collectors.toList());

        // ── توزیع نقش‌های کاربران ──
        Map<String, String> roleNames = Map.of(
                "ROLE_USER", "مسافر",
                "ROLE_CEO", "مدیر آژانس",
                "ROLE_ADMIN", "ادمین",
                "ROLE_SUPERADMIN", "سوپرادمین"
        );
        List<AdminAnalyticsResponse.RoleSlice> roleDistribution = new ArrayList<>();
        for (Map.Entry<String, String> entry : roleNames.entrySet()) {
            long count = users.stream()
                    .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals(entry.getKey())))
                    .count();
            roleDistribution.add(AdminAnalyticsResponse.RoleSlice.builder()
                    .role(entry.getKey())
                    .persianName(entry.getValue())
                    .count(count)
                    .build());
        }

        // ── برترین آژانس‌ها (بر اساس درآمد رزروهای تأیید شده) ──
        Map<String, List<Reservation>> byAgency = reservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .collect(Collectors.groupingBy(r -> r.getTour().getCreatedBy().getUsername()));
        List<AdminAnalyticsResponse.TopAgency> topAgencies = byAgency.entrySet().stream()
                .map(e -> {
                    String username = e.getKey();
                    long passengers = e.getValue().stream().mapToLong(Reservation::getPassengerCount).sum();
                    BigDecimal revenue = e.getValue().stream()
                            .map(Reservation::getTotalPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    String agencyName = verificationRepository.findByUsername(username)
                            .map(CeoVerification::getAgencyName)
                            .orElse(username);
                    return AdminAnalyticsResponse.TopAgency.builder()
                            .username(username)
                            .agencyName(agencyName)
                            .reservations(e.getValue().size())
                            .passengers(passengers)
                            .revenue(revenue)
                            .build();
                })
                .sorted(Comparator.comparing(AdminAnalyticsResponse.TopAgency::getRevenue).reversed())
                .limit(5)
                .collect(Collectors.toList());

        // ── مجموع کل پلتفرم ──
        long confirmedReservations = reservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .count();
        BigDecimal totalRevenue = reservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .map(Reservation::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long totalCeos = users.stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_CEO")))
                .count();
        long pendingVerifications = verificationRepository.countByStatus(VerificationStatus.PENDING);

        AdminAnalyticsResponse.PlatformTotals totals = AdminAnalyticsResponse.PlatformTotals.builder()
                .totalUsers(users.size())
                .totalCeos(totalCeos)
                .totalTours(tours.size())
                .totalReservations(reservations.size())
                .confirmedReservations(confirmedReservations)
                .totalRevenue(totalRevenue)
                .pendingVerifications(pendingVerifications)
                .build();

        return AdminAnalyticsResponse.builder()
                .reservationsByDay(reservationsByDay)
                .revenueByMonth(revenueByMonth)
                .toursByMonth(toursByMonth)
                .reservationStatusDistribution(statusDistribution)
                .roleDistribution(roleDistribution)
                .topAgencies(topAgencies)
                .totals(totals)
                .build();
    }
}
