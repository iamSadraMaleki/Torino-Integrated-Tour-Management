package com.example.project.ceo_personel.services;



import com.example.project.ceo_personel.dto.StaffMemberDto;
import com.example.project.ceo_personel.dto.StaffMemberRequest;
import com.example.project.ceo_personel.dto.StaffStatisticsDto;

import java.util.List;

public interface StaffMemberService {

    StaffMemberDto createStaffMember(String username, StaffMemberRequest request);

    StaffMemberDto updateStaffMember(String username, Long staffId, StaffMemberRequest request);

    void deleteStaffMember(String username, Long staffId);

    StaffMemberDto getStaffMemberById(String username, Long staffId);

    List<StaffMemberDto> getAllStaffMembers(String username);

    List<StaffMemberDto> getActiveStaffMembers(String username);

    List<StaffMemberDto> getStaffMembersByPosition(String username, Long positionId);

    StaffStatisticsDto getStatistics(String username);
}

