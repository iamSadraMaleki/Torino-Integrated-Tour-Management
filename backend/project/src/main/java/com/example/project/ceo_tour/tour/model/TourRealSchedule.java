package com.example.project.ceo_tour.tour.model;

import jakarta.persistence.*;

import java.time.*;

@Entity
@Table(name = "tour_real_schedule")
public class TourRealSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    private Long stationId;

    @Enumerated(EnumType.STRING)
    private StationCategory stationCategory;

    private Integer orderIndex;

    private LocalDate scheduleDate;

    private LocalTime plannedArrivalTime;

    private Integer delayMinutes; // nullable

    private LocalTime finalArrivalTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Tour getTour() {
        return tour;
    }

    public void setTour(Tour tour) {
        this.tour = tour;
    }

    public Long getStationId() {
        return stationId;
    }

    public void setStationId(Long stationId) {
        this.stationId = stationId;
    }

    public StationCategory getStationCategory() {
        return stationCategory;
    }

    public void setStationCategory(StationCategory stationCategory) {
        this.stationCategory = stationCategory;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }

    public LocalDate getScheduleDate() {
        return scheduleDate;
    }

    public void setScheduleDate(LocalDate scheduleDate) {
        this.scheduleDate = scheduleDate;
    }

    public LocalTime getPlannedArrivalTime() {
        return plannedArrivalTime;
    }

    public void setPlannedArrivalTime(LocalTime plannedArrivalTime) {
        this.plannedArrivalTime = plannedArrivalTime;
    }

    public Integer getDelayMinutes() {
        return delayMinutes;
    }

    public void setDelayMinutes(Integer delayMinutes) {
        this.delayMinutes = delayMinutes;
    }

    public LocalTime getFinalArrivalTime() {
        return finalArrivalTime;
    }

    public void setFinalArrivalTime(LocalTime finalArrivalTime) {
        this.finalArrivalTime = finalArrivalTime;
    }

}