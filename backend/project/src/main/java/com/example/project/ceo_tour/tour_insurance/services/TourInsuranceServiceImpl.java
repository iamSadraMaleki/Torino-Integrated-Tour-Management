package com.example.project.ceo_tour.tour_insurance.services;

import com.example.project.ceo_insurance.model.InsurancePolicy;
import com.example.project.ceo_insurance.repository.InsurancePolicyRepository;
import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.ceo_tour.tour.repository.TourRepository;
import com.example.project.ceo_tour.tour_insurance.dto.TourInsuranceDto;
import com.example.project.ceo_tour.tour_insurance.dto.TourInsuranceMapper;
import com.example.project.ceo_tour.tour_insurance.dto.TourInsuranceRequest;
import com.example.project.ceo_tour.tour_insurance.model.TourInsurance;
import com.example.project.ceo_tour.tour_insurance.repository.TourInsuranceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourInsuranceServiceImpl implements TourInsuranceService {

    private final TourInsuranceRepository tourInsuranceRepository;
    private final TourRepository tourRepository;
    private final InsurancePolicyRepository insuranceRepository;
    private final TourInsuranceMapper mapper;

    @Override
    @Transactional
    public TourInsuranceDto add(TourInsuranceRequest request) {
        log.info("Adding insurance [{}] to tour [{}]",
                request.getInsurancePolicyId(), request.getTourId());

        if (tourInsuranceRepository.existsByTourIdAndInsurancePolicyId(
                request.getTourId(), request.getInsurancePolicyId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "این بیمه قبلاً به این تور اختصاص داده شده است");
        }

        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "تور پیدا نشد"));

        InsurancePolicy policy = insuranceRepository.findById(request.getInsurancePolicyId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "بیمه‌نامه پیدا نشد"));

        TourInsurance entity = TourInsurance.builder()
                .tour(tour)
                .insurancePolicy(policy)
                .price(request.getPrice())
                .build();

        TourInsurance saved = tourInsuranceRepository.save(entity);
        log.info("Insurance [{}] added to tour [{}] with id [{}]",
                policy.getName(), tour.getId(), saved.getId());

        return mapper.toDto(saved);
    }

    @Override
    @Transactional
    public TourInsuranceDto update(Long id, TourInsuranceRequest request) {
        log.info("Updating TourInsurance id [{}]", id);

        TourInsurance entity = tourInsuranceRepository.findByIdAndTourId(id, request.getTourId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "بیمه تور پیدا نشد"));

        InsurancePolicy policy = insuranceRepository.findById(request.getInsurancePolicyId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "بیمه‌نامه پیدا نشد"));

        entity.setInsurancePolicy(policy);
        entity.setPrice(request.getPrice());

        TourInsurance updated = tourInsuranceRepository.save(entity);
        log.info("TourInsurance id [{}] updated successfully", updated.getId());

        return mapper.toDto(updated);
    }

    @Override
    @Transactional
    public void remove(Long id) {
        log.info("Removing TourInsurance id [{}]", id);

        TourInsurance entity = tourInsuranceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "بیمه تور پیدا نشد"));

        tourInsuranceRepository.delete(entity);
        log.info("TourInsurance id [{}] removed successfully", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourInsuranceDto> getByTour(Long tourId) {
        log.debug("Fetching insurances for tour [{}]", tourId);

        List<TourInsuranceDto> result = tourInsuranceRepository.findAllByTourId(tourId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toUnmodifiableList());

        log.debug("Found [{}] insurances for tour [{}]", result.size(), tourId);
        return result;
    }
}
