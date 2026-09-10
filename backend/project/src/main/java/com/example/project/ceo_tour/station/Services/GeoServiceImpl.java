package com.example.project.ceo_tour.station.Services;


import com.example.project.ceo_tour.station.Repository.CityRepository;
import com.example.project.ceo_tour.station.Repository.ProvinceRepository;
import com.example.project.ceo_tour.station.dto.CityDto;
import com.example.project.ceo_tour.station.dto.ProvinceDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GeoServiceImpl implements GeoService {

    private final ProvinceRepository provinceRepository;
    private final CityRepository cityRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProvinceDto> getAllProvinces() {
        return provinceRepository.findAll().stream()
                .map(ProvinceDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CityDto> getCitiesByProvince(Long provinceId) {
        if (provinceId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "provinceId is required");
        }

        boolean provinceExists = provinceRepository.existsById(provinceId);
        if (!provinceExists) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Province not found");
        }

        return cityRepository.findAllByProvinceIdOrderByNameAsc(provinceId).stream()
                .map(CityDto::fromEntity)
                .toList();
    }
}
