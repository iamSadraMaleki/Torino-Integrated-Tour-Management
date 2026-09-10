package com.example.project.ceo_tour.station.Services;


import com.example.project.ceo_tour.station.dto.CityDto;
import com.example.project.ceo_tour.station.dto.ProvinceDto;

import java.util.List;

public interface GeoService {
    List<ProvinceDto> getAllProvinces();
    List<CityDto> getCitiesByProvince(Long provinceId);
}
