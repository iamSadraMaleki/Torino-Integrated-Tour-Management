package com.example.project.ceo_tour.tour.services;

import com.example.project.ceo_tour.tour.dto.*;
import com.example.project.ceo_tour.tour.model.*;
import com.example.project.ceo_tour.tour.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TourRealScheduleServiceImpl implements TourRealScheduleService {

    private final TourRepository tourRepository;
    private final TourOriginStationRepository originRepository;
    private final TourDestinationStationRepository destinationRepository;
    private final TourProgramStationRepository programRepository;
    private final TourRealScheduleRepository scheduleRepository;

    // =========================================================
    // GENERATE SCHEDULE
    // =========================================================
    @Override
    public List<TourRealScheduleResponseDTO> generateSchedule(
            CreateTourScheduleRequestDTO request) {

        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        scheduleRepository.deleteByTour_Id(tour.getId());

        LocalTime currentTime = request.getStartTime();
        int orderCounter = 1;

        List<TourRealSchedule> schedules = new ArrayList<>();

        // =====================================================
        // 1️⃣ ORIGIN (مبدا)
        // =====================================================
        List<TourOriginStation> origins =
                originRepository
                        .findAllByTour_IdAndIsActiveTrueOrderByOrderNoAsc(tour.getId());

        for (TourOriginStation station : origins) {

            schedules.add(buildItem(
                    tour,
                    station.getStation().getId(),
                    StationCategory.ORIGIN,
                    orderCounter++,
                    request.getScheduleDate(),
                    currentTime
            ));

            if (station.getMinutesToNext() != null) {
                currentTime = currentTime.plusMinutes(
                        station.getMinutesToNext());
            }
        }

        // =====================================================
        // 2️⃣ PROGRAM (ایستگاه‌های بین مسیر)
        // =====================================================
        List<TourProgramStation> programs =
                programRepository
                        .findAllByTour_IdAndIsActiveTrueOrderByOrderNoAsc(tour.getId());

        for (TourProgramStation station : programs) {

            schedules.add(buildItem(
                    tour,
                    station.getStation().getId(),
                    StationCategory.PROGRAM,
                    orderCounter++,
                    request.getScheduleDate(),
                    currentTime
            ));

            if (station.getMinutesToNext() != null) {
                currentTime = currentTime.plusMinutes(
                        station.getMinutesToNext());
            }
        }

        // =====================================================
        // 3️⃣ DESTINATION (مقصد نهایی)
        // =====================================================
        List<TourDestinationStation> destinations =
                destinationRepository
                        .findAllByTour_IdAndIsActiveTrueOrderByOrderNoAsc(tour.getId());

        for (TourDestinationStation station : destinations) {

            schedules.add(buildItem(
                    tour,
                    station.getStation().getId(),
                    StationCategory.DESTINATION,
                    orderCounter++,
                    request.getScheduleDate(),
                    currentTime
            ));

            if (station.getMinutesToNext() != null) {
                currentTime = currentTime.plusMinutes(
                        station.getMinutesToNext());
            }
        }

        scheduleRepository.saveAll(schedules);

        return schedules.stream()
                .map(this::toDTO)
                .toList();
    }

    // =========================================================
    // APPLY DELAY (زنجیره‌ای حرفه‌ای)
    // =========================================================
    @Override
    public List<TourRealScheduleResponseDTO> applyDelay(
            ApplyDelayDTO request) {

        TourRealSchedule selected =
                scheduleRepository.findById(request.getScheduleId())
                        .orElseThrow(() -> new RuntimeException("Schedule not found"));

        // ثبت تاخیر روی ایستگاه انتخاب‌شده
        selected.setDelayMinutes(request.getDelayMinutes());

        // همه ایستگاه‌های تور مرتب شده
        List<TourRealSchedule> schedules =
                scheduleRepository
                        .findAllByTour_IdOrderByOrderIndexAsc(
                                selected.getTour().getId());

        int accumulatedDelay = 0;

        for (TourRealSchedule item : schedules) {

            // اگر این ایستگاه delay دارد → جمع کن
            if (item.getDelayMinutes() != null) {
                accumulatedDelay += item.getDelayMinutes();
            }

            // محاسبه زمان نهایی با مجموع کل تاخیرهای قبل
            item.setFinalArrivalTime(
                    item.getPlannedArrivalTime()
                            .plusMinutes(accumulatedDelay)
            );
        }

        scheduleRepository.saveAll(schedules);

        return schedules.stream()
                .map(this::toDTO)
                .toList();
    }

    // =========================================================
    // GET BY TOUR
    // =========================================================
    @Override
    @Transactional
    public List<TourRealScheduleResponseDTO> getByTour(Long tourId) {

        return scheduleRepository
                .findAllByTour_IdOrderByOrderIndexAsc(tourId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // =========================================================
    // PRIVATE BUILDER
    // =========================================================
    private TourRealSchedule buildItem(
            Tour tour,
            Long stationId,
            StationCategory category,
            int order,
            LocalDate date,
            LocalTime plannedTime) {

        TourRealSchedule item = new TourRealSchedule();

        item.setTour(tour);
        item.setStationId(stationId);
        item.setStationCategory(category);
        item.setOrderIndex(order);
        item.setScheduleDate(date);
        item.setPlannedArrivalTime(plannedTime);
        item.setDelayMinutes(null);
        item.setFinalArrivalTime(plannedTime);

        return item;
    }

    // =========================================================
    // MAPPER
    // =========================================================
    private TourRealScheduleResponseDTO toDTO(TourRealSchedule entity) {

        return TourRealScheduleResponseDTO.builder()
                .id(entity.getId())
                .stationId(entity.getStationId())
                .stationCategory(entity.getStationCategory().name())
                .orderIndex(entity.getOrderIndex())
                .scheduleDate(entity.getScheduleDate())
                .plannedArrivalTime(entity.getPlannedArrivalTime())
                .delayMinutes(entity.getDelayMinutes())
                .finalArrivalTime(entity.getFinalArrivalTime())
                .build();
    }
}