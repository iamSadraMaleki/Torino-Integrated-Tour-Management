package com.example.project.ceo_tour.tour_insurance.dto;

import com.example.project.ceo_insurance.model.InsurancePolicyType;
import com.example.project.ceo_tour.tour_insurance.model.TourInsurance;
import org.springframework.stereotype.Component;

@Component
public class TourInsuranceMapper {

    public TourInsuranceDto toDto(TourInsurance entity) {
        String typePersian = "";
        InsurancePolicyType type = entity.getInsurancePolicy().getInsuranceType();
        switch (type) {
            case TRAVEL: typePersian = "بیمه مسافرتی"; break;
            case HEALTH: typePersian = "بیمه درمانی"; break;
            case ACCIDENT: typePersian = "بیمه حوادث"; break;
            default: typePersian = "سایر";
        }
        return TourInsuranceDto.builder()
                .id(entity.getId())
                .tourId(entity.getTour().getId())
                .insurancePolicyId(entity.getInsurancePolicy().getId())
                .policyName(entity.getInsurancePolicy().getName())
                .policyType(entity.getInsurancePolicy().getInsuranceType().name())
                .policyTypePersian(typePersian)
                .coverageAmount(entity.getInsurancePolicy().getCoverageAmount())
                .price(entity.getPrice())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
