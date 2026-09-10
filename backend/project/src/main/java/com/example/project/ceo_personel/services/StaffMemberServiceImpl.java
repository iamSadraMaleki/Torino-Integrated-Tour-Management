package com.example.project.ceo_personel.services;


import com.example.project.ceo_personel.dto.StaffMemberDto;
import com.example.project.ceo_personel.dto.StaffMemberMapper;
import com.example.project.ceo_personel.dto.StaffMemberRequest;
import com.example.project.ceo_personel.dto.StaffStatisticsDto;
import com.example.project.ceo_personel.model.Position;
import com.example.project.ceo_personel.model.StaffMember;
import com.example.project.ceo_personel.repository.PositionRepository;
import com.example.project.ceo_personel.repository.StaffMemberRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffMemberServiceImpl implements StaffMemberService {

    private final StaffMemberRepository staffMemberRepository;
    private final PositionRepository positionRepository;
    private final UserRepository userRepository;
    private final StaffMemberMapper staffMemberMapper;
    private static final Logger logger = LoggerFactory.getLogger(StaffMemberServiceImpl.class);

    @Override
    @Transactional
    public StaffMemberDto createStaffMember(String username, StaffMemberRequest request) {
        logger.info("Creating staff member for CEO: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));


        if (staffMemberRepository.existsByUserIdAndNationalCode(user.getId(), request.getNationalCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "کارمندی با این کد ملی قبلاً ثبت شده است");
        }

        Position position = positionRepository.findByIdAndUserId(request.getPositionId(), user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "سمت مورد نظر پیدا نشد یا متعلق به شما نیست"));

        StaffMember staffMember = StaffMember.builder()
                .user(user)
                .position(position)
                .fullName(request.getFullName())
                .nationalCode(request.getNationalCode())
                .fatherName(request.getFatherName())
                .birthDate(request.getBirthDate())
                .phoneNumber(request.getPhoneNumber())
                .workExperience(request.getWorkExperience())
                .address(request.getAddress())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .hireDate(request.getHireDate())
                .build();

        StaffMember saved = staffMemberRepository.save(staffMember);
        logger.info("Staff member created successfully with id: {}", saved.getId());

        return staffMemberMapper.toDto(saved);
    }

    @Override
    @Transactional
    public StaffMemberDto updateStaffMember(String username, Long staffId, StaffMemberRequest request) {
        logger.info("Updating staff member id: {} for CEO: {}", staffId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        StaffMember staffMember = staffMemberRepository.findByIdAndUserId(staffId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کارمند پیدا نشد"));

        // بررسی تکراری نبودن کد ملی (اگر تغییر کرده باشد)
        if (!staffMember.getNationalCode().equals(request.getNationalCode())) {
            if (staffMemberRepository.existsByUserIdAndNationalCode(user.getId(), request.getNationalCode())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "کارمندی با این کد ملی قبلاً ثبت شده است");
            }
        }

        Position position = positionRepository.findByIdAndUserId(request.getPositionId(), user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "سمت مورد نظر پیدا نشد یا متعلق به شما نیست"));

        staffMember.setPosition(position);
        staffMember.setFullName(request.getFullName());
        staffMember.setNationalCode(request.getNationalCode());
        staffMember.setFatherName(request.getFatherName());
        staffMember.setBirthDate(request.getBirthDate());
        staffMember.setPhoneNumber(request.getPhoneNumber());
        staffMember.setWorkExperience(request.getWorkExperience());
        staffMember.setAddress(request.getAddress());
        if (request.getIsActive() != null) {
            staffMember.setIsActive(request.getIsActive());
        }
        if (request.getHireDate() != null) {
            staffMember.setHireDate(request.getHireDate());
        }

        StaffMember updated = staffMemberRepository.save(staffMember);
        logger.info("Staff member updated successfully");

        return staffMemberMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void deleteStaffMember(String username, Long staffId) {
        logger.info("Deleting staff member id: {} for CEO: {}", staffId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        StaffMember staffMember = staffMemberRepository.findByIdAndUserId(staffId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کارمند پیدا نشد"));

        staffMemberRepository.delete(staffMember);
        logger.info("Staff member deleted successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public StaffMemberDto getStaffMemberById(String username, Long staffId) {
        logger.info("Fetching staff member id: {} for CEO: {}", staffId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        StaffMember staffMember = staffMemberRepository.findByIdAndUserId(staffId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کارمند پیدا نشد"));

        return staffMemberMapper.toDto(staffMember);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffMemberDto> getAllStaffMembers(String username) {
        logger.info("Fetching all staff members for CEO: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        return staffMemberRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(staffMemberMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffMemberDto> getActiveStaffMembers(String username) {
        logger.info("Fetching active staff members for CEO: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        return staffMemberRepository.findByUserIdAndIsActiveTrueOrderByFullNameAsc(user.getId())
                .stream()
                .map(staffMemberMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffMemberDto> getStaffMembersByPosition(String username, Long positionId) {
        logger.info("Fetching staff members by position id: {} for CEO: {}", positionId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        // بررسی اینکه سمت متعلق به این CEO باشد
        positionRepository.findByIdAndUserId(positionId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "سمت مورد نظر پیدا نشد یا متعلق به شما نیست"));

        return staffMemberRepository.findByPositionIdOrderByFullNameAsc(positionId)
                .stream()
                .map(staffMemberMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public StaffStatisticsDto getStatistics(String username) {
        logger.info("Fetching staff statistics for CEO: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        List<StaffMember> allStaff = staffMemberRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        long totalStaff = allStaff.size();
        long activeStaff = allStaff.stream().filter(StaffMember::getIsActive).count();
        long inactiveStaff = totalStaff - activeStaff;

        long totalPositions = positionRepository.countActivePositionsByUserId(user.getId());

        // آمار به تفکیک سمت
        List<Object[]> staffByPositionData = staffMemberRepository.countStaffByPositionForUser(user.getId());
        Map<String, Long> staffByPosition = new HashMap<>();
        for (Object[] row : staffByPositionData) {
            String positionTitle = (String) row[0];
            Long count = (Long) row[1];
            staffByPosition.put(positionTitle, count);
        }

        return StaffStatisticsDto.builder()
                .totalStaff(totalStaff)
                .activeStaff(activeStaff)
                .inactiveStaff(inactiveStaff)
                .totalPositions(totalPositions)
                .staffByPosition(staffByPosition)
                .build();
    }

}

