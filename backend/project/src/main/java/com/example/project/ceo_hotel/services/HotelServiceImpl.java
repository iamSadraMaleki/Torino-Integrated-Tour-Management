package com.example.project.ceo_hotel.services;

import com.example.project.ceo_hotel.dto.HotelDto;
import com.example.project.ceo_hotel.dto.HotelMapper;
import com.example.project.ceo_hotel.dto.HotelRequest;
import com.example.project.ceo_hotel.model.Hotel;
import com.example.project.ceo_hotel.repository.HotelRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final HotelMapper hotelMapper;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.debug("Fetching current user with username: {}", username);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("Authenticated user not found in database: {}", username);
                    return new IllegalStateException("Authenticated user not found: " + username);
                });
    }

    @Override
    @Transactional
    public HotelDto createHotel(HotelRequest request) {
        User user = getCurrentUser();
        log.info("User [{}] is creating hotel: {}", user.getUsername(), request.getName());

        if (hotelRepository.existsByNameAndUserId(request.getName(), user.getId())) {
            log.warn("User [{}] attempted to create duplicate hotel: {}", user.getUsername(), request.getName());
            throw new DuplicateHotelException("Hotel with name '" + request.getName() + "' already exists");
        }

        Hotel hotel = hotelMapper.toEntity(request);
        hotel.setUser(user);

        Hotel saved = hotelRepository.save(hotel);
        log.info("Hotel created successfully with id [{}] for user [{}]", saved.getId(), user.getUsername());

        return hotelMapper.toDto(saved);
    }

    @Override
    @Transactional
    public HotelDto updateHotel(Long id, HotelRequest request) {
        User user = getCurrentUser();
        log.info("User [{}] is updating hotel id [{}]", user.getUsername(), id);

        Hotel hotel = hotelRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> {
                    log.warn("Hotel id [{}] not found for user [{}]", id, user.getUsername());
                    return new HotelNotFoundException("Hotel not found with id: " + id);
                });

        hotel.setName(request.getName());
        hotel.setAddress(request.getAddress());
        hotel.setStars(request.getStars());
        hotel.setCity(request.getCity());

        Hotel updated = hotelRepository.save(hotel);
        log.info("Hotel id [{}] updated successfully", updated.getId());

        return hotelMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void deleteHotel(Long id) {
        User user = getCurrentUser();
        log.info("User [{}] is deleting hotel id [{}]", user.getUsername(), id);

        Hotel hotel = hotelRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> {
                    log.warn("Hotel id [{}] not found for user [{}] during delete", id, user.getUsername());
                    return new HotelNotFoundException("Hotel not found with id: " + id);
                });

        hotelRepository.delete(hotel);
        log.info("Hotel id [{}] deleted successfully by user [{}]", id, user.getUsername());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelDto> getUserHotels() {
        User user = getCurrentUser();
        log.debug("Fetching all hotels for user [{}]", user.getUsername());

        List<HotelDto> hotels = hotelRepository.findAllByUserId(user.getId())
                .stream()
                .map(hotelMapper::toDto)
                .collect(Collectors.toUnmodifiableList());

        log.debug("Found [{}] hotels for user [{}]", hotels.size(), user.getUsername());
        return hotels;
    }

    @Override
    @Transactional(readOnly = true)
    public HotelDto getHotelById(Long id) {
        User user = getCurrentUser();
        log.debug("Fetching hotel id [{}] for user [{}]", id, user.getUsername());

        Hotel hotel = hotelRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> {
                    log.warn("Hotel id [{}] not found for user [{}]", id, user.getUsername());
                    return new HotelNotFoundException("Hotel not found with id: " + id);
                });

        return hotelMapper.toDto(hotel);
    }
}
