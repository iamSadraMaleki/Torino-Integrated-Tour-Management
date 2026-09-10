package com.example.project.ceo_tour.station.Services;


import com.example.project.ceo_tour.station.Repository.*;
import com.example.project.ceo_tour.station.dto.*;
import com.example.project.ceo_tour.station.model.*;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StationServiceImpl implements StationService {

    private final StationRepository stationRepository;
    private final StationImageRepository stationImageRepository;
    private final StationTypeRepository stationTypeRepository;

    private final ProvinceRepository provinceRepository;
    private final CityRepository cityRepository;

    private final UserRepository userRepository;

    private User requireUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private StationType requireMyType(String username, Long typeId) {
        return stationTypeRepository.findByIdAndCreatedByUsername(typeId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Station type not found"));
    }

    private Station requireMyStation(String username, Long stationId) {
        return stationRepository.findByIdAndCreatedByUsername(stationId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Station not found"));
    }

    private StationImage saveImage(String username, User uploader, MultipartFile file, String description) {
        if (file == null || file.isEmpty()) return null;

        // ساده و امن: فقط عکس
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are allowed");
        }

        try {
            StationImage img = StationImage.builder()
                    .uploadedBy(uploader)
                    .imageBytes(file.getBytes())
                    .description(description)
                    .build();
            return stationImageRepository.save(img);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to read image file");
        }
    }

    @Override
    @Transactional
    public StationDto create(String username, StationCreateRequest request, MultipartFile image) {
        User ceo = requireUser(username);

        var province = provinceRepository.findById(request.getProvinceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Province not found"));

        var city = cityRepository.findById(request.getCityId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "City not found"));

        // (اختیاری ولی بهتر) چک اینکه شهر متعلق به همون استان باشه
        if (!city.getProvince().getId().equals(province.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "City does not belong to selected province");
        }

        StationType type = requireMyType(username, request.getStationTypeId());

        StationImage savedImage = saveImage(username, ceo, image, request.getImageDescription());

        Station station = Station.builder()
                .province(province)
                .city(city)
                .stationName(request.getStationName().trim())
                .stationType(type)
                .stationImage(savedImage)
                .createdBy(ceo)
                .location(request.getLocation())
                .build();

        Station saved = stationRepository.save(station);
        return StationDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public StationDto update(String username, Long stationId, StationUpdateRequest request, MultipartFile image) {
        User ceo = requireUser(username);
        Station station = requireMyStation(username, stationId);

        if (request.getProvinceId() != null) {
            var province = provinceRepository.findById(request.getProvinceId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Province not found"));
            station.setProvince(province);
        }

        if (request.getCityId() != null) {
            var city = cityRepository.findById(request.getCityId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "City not found"));
            station.setCity(city);
        }


        if (station.getCity() != null && station.getProvince() != null) {
            if (!station.getCity().getProvince().getId().equals(station.getProvince().getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "City does not belong to selected province");
            }
        }

        if (request.getStationTypeId() != null) {
            StationType type = requireMyType(username, request.getStationTypeId());
            station.setStationType(type);
        }

        if (request.getStationName() != null && !request.getStationName().isBlank()) {
            station.setStationName(request.getStationName().trim());
        }

        if (request.getLocation() != null) {
            station.setLocation(request.getLocation());
        }

        if (image != null && !image.isEmpty()) {
            StationImage newImage = saveImage(username, ceo, image, request.getImageDescription());
            station.setStationImage(newImage);
        }

        Station saved = stationRepository.save(station);
        return StationDto.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StationDto> getMyStations(String username) {
        return stationRepository.findAllByCreatedByUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(StationDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StationDto getById(String username, Long stationId) {
        return StationDto.fromEntity(requireMyStation(username, stationId));
    }

    @Override
    @Transactional
    public void delete(String username, Long stationId) {
        Station station = requireMyStation(username, stationId);


        stationRepository.delete(station);
    }
    @Override
    @Transactional(readOnly = true)
    public StationImageDownload getImage(String username, Long imageId) {

        // فقط مالک (آپلودکننده) بتواند عکس را ببیند
        var img = stationImageRepository.findByIdAndUploadedByUsername(imageId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found"));

        if (img.getImageBytes() == null || img.getImageBytes().length == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image data not found");
        }

        return StationImageDownload.builder()
                .bytes(img.getImageBytes())
                .contentType("image/jpeg")
                .filename("station-image-" + img.getId() + ".jpg")
                .build();
    }

}

