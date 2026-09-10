package com.example.project.profile.ceoinfo.services;


import com.example.project.profile.ceoinfo.dto.CeoProfileDto;
import com.example.project.profile.ceoinfo.dto.CeoProfileRequest;
import jakarta.servlet.http.HttpServletRequest;

public interface CeoProfileService {

    CeoProfileDto createProfile(String username, CeoProfileRequest request, HttpServletRequest httpRequest);

    CeoProfileDto updateProfile(String username, CeoProfileRequest request, HttpServletRequest httpRequest);

    CeoProfileDto getProfile(String username);

    CeoProfileDto getProfileById(Long profileId);

    void deleteProfile(String username);
}

