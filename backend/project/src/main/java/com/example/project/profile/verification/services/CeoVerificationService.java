package com.example.project.profile.verification.services;

import com.example.project.profile.verification.dto.CeoVerificationDto;
import com.example.project.profile.verification.dto.CeoVerificationRequest;
import com.example.project.profile.verification.dto.CeoVerificationResponse;

import java.util.List;
import java.util.Map;

public interface CeoVerificationService {

    CeoVerificationResponse submitVerification(String username, CeoVerificationRequest request);

    CeoVerificationDto getVerificationStatus(String username);

    List<CeoVerificationDto> getPendingVerifications();

    List<CeoVerificationDto> getAllVerifications();

    CeoVerificationResponse approveVerification(Long verificationId, String adminUsername);

    CeoVerificationResponse rejectVerification(Long verificationId, String adminUsername, String rejectionReason);

    boolean isUserVerified(String username);

    Map<String, Object> getUserVerificationStatus(String username);

    Map<String, Object> updateUserVerificationStatus(String username, String newStatus, String adminUsername);

    Map<String, Object> getVerificationStatistics();
}

