package com.example.project.ceo_insurance.services;

import com.example.project.ceo_insurance.dto.InsurancePolicyDto;
import com.example.project.ceo_insurance.dto.InsurancePolicyRequest;

import java.util.List;

public interface InsurancePolicyService {

    InsurancePolicyDto create(String ceoUsername, InsurancePolicyRequest request);

    InsurancePolicyDto update(String ceoUsername, Long policyId, InsurancePolicyRequest request);

    void delete(String ceoUsername, Long policyId);

    InsurancePolicyDto getById(String ceoUsername, Long policyId);

    List<InsurancePolicyDto> getAll(String ceoUsername);
}
