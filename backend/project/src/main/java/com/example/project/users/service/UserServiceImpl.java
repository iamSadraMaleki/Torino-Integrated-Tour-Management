package com.example.project.users.service;

import com.example.project.profile.changepassword.ChangePasswordRequest;
import com.example.project.profile.changepassword.PasswordLog;
import com.example.project.profile.changepassword.PasswordLogRepository;
import com.example.project.users.config.JwtService;
import com.example.project.users.dto.AuthResponse;
import com.example.project.users.dto.LoginRequest;
import com.example.project.users.dto.RegisterRequest;
import com.example.project.users.dto.UserDto;
import com.example.project.users.dto.UpdateProfileRequest;
import com.example.project.users.model.Role;
import com.example.project.users.model.User;
import com.example.project.users.Repasitory.RoleRepository;
import com.example.project.users.Repasitory.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordLogRepository passwordLogRepository;
    private final SecureRandom random = new SecureRandom();
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordLogRepository passwordLogRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtService jwtService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.passwordLogRepository = passwordLogRepository;
    }

    @Override
    @Transactional
    public UserDto registerPublic(RegisterRequest request) {
        String username = request.getUsername().trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        if (userRepository.existsByMobile(request.getMobile())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mobile already exists");
        }

        String uniqueCode = generateUniqueCustomerCode();

        // role allowed: USER (default) or CEO
        String requestedRole = (request.getRole() == null || request.getRole().isBlank())
                ? "ROLE_USER"
                : request.getRole().trim().toUpperCase();

        if (!(requestedRole.equals("ROLE_USER") || requestedRole.equals("ROLE_CEO"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role for public registration");
        }

        Role selectedRole = roleRepository.findByName(requestedRole)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR, requestedRole + " missing"));

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setMobile(request.getMobile());
        user.setCustomerCode(uniqueCode);
        user.setEnabled(true);
        if (request.getCity() != null && !request.getCity().isBlank()) {
            user.setCity(request.getCity().trim());
        }

        user.getRoles().add(selectedRole);

        userRepository.save(user);
        logger.info("Public registered new user: {} with role {}", user.getUsername(), requestedRole);

        return toDto(user);
    }


    @Override
    public AuthResponse login(LoginRequest request) {
        String username = request.getUsername().trim().toLowerCase();
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, request.getPassword())
        );
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        java.util.Set<String> roles = user.getRoles().stream().map(Role::getName).collect(java.util.stream.Collectors.toSet());
        String token = jwtService.generateToken(auth.getName(), roles);
        logger.info("User logged in: {}", auth.getName());
        return new AuthResponse(token, roles);
    }

    @Override
    public UserDto me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            logger.warn("No authenticated user found");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return getCurrentUser(auth.getName());
    }

    @Override
    public UserDto getCurrentUser(String username) {
        logger.info("Service: Looking for user with username: '{}'", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.error("User not found for username: '{}'", username);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
                });
        logger.info("Service: User found: {}", user.getUsername());
        return toDto(user);
    }

    private String generateUniqueCustomerCode() {
        String code;
        do {
            int num = 1_000_000 + random.nextInt(9_000_000);
            code = String.valueOf(num);
        } while (userRepository.existsByCustomerCode(code));
        return code;
    }

    private UserDto toDto(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .enabled(user.isEnabled())
                .customerCode(user.getCustomerCode())
                .city(user.getCity())
                .roles(roles)
                .build();
    }

    @Override
    @Transactional
    public UserDto changePassword(ChangePasswordRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            logger.warn("No authenticated user found");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> {
                    logger.error("User not found for username: '{}'", auth.getName());
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
                });

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            logger.warn("Old password incorrect for user: {}", user.getUsername());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Old password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            logger.warn("New passwords do not match for user: {}", user.getUsername());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New passwords do not match");
        }

        String oldHashed = user.getPassword();
        String newHashed = passwordEncoder.encode(request.getNewPassword());

        user.setPassword(newHashed);
        userRepository.save(user);

        PasswordLog log = PasswordLog.builder()
                .username(user.getUsername())
                .oldPassword(oldHashed)
                .newPassword(newHashed)
                .changedAt(LocalDateTime.now())
                .build();
        passwordLogRepository.save(log);

        logger.info("Password changed for user: {}", user.getUsername());
        return toDto(user);
    }

    @Override
    @Transactional
    public UserDto updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .or(() -> Optional.ofNullable(request.getEmail())
                        .flatMap(userRepository::findByEmail))
                .or(() -> Optional.ofNullable(request.getMobile())
                        .flatMap(userRepository::findByMobile))
                .orElseThrow(() -> {
                    logger.error("User not found for username/email/mobile");
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
                });

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail());
        }
        if (request.getMobile() != null && !request.getMobile().isBlank()) {
            user.setMobile(request.getMobile());
        }
        if (request.getCity() != null && !request.getCity().isBlank()) {
            user.setCity(request.getCity().trim());
        }

        User saved = userRepository.save(user);
        logger.info("Profile updated for user: {}", saved.getUsername());
        return UserDto.fromEntity(saved);
    }
    @Override
    public List<UserDto> getAllUsers() {
        logger.info("Fetching all users");
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDto> getUsersByRole(String roleName) {
        logger.info("Fetching users with role: {}", roleName);

        String normalizedRoleName = roleName.toUpperCase().startsWith("ROLE_")
                ? roleName.toUpperCase()
                : "ROLE_" + roleName.toUpperCase();

        List<User> users = userRepository.findByRoles_Name(normalizedRoleName);

        if (users.isEmpty()) {
            logger.warn("No users found with role: {}", normalizedRoleName);
        }

        return users.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserDto toggleUserEnabled(Long userId) {
        logger.info("Toggling enabled status for user ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with ID: {}", userId);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
                });

        boolean newStatus = !user.isEnabled();
        user.setEnabled(newStatus);
        userRepository.save(user);

        logger.info("User {} enabled status changed to: {}", user.getUsername(), newStatus);
        return toDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(Long userId) {
        logger.info("Fetching user by ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with ID: {}", userId);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد");
                });
        return toDto(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        logger.info("Deleting user with ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with ID: {}", userId);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد");
                });
        
        // بررسی اینکه کاربر سوپر ادمین نباشد (برای جلوگیری از حذف خود)
        boolean isSuperAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ROLE_SUPERADMIN"));
        
        if (isSuperAdmin) {
            logger.warn("Attempt to delete SUPERADMIN user: {}", user.getUsername());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "نمی‌توانید کاربر سوپر ادمین را حذف کنید");
        }
        
        userRepository.delete(user);
        logger.info("User {} deleted successfully", user.getUsername());
    }

    @Override
    @Transactional
    public UserDto registerSuperAdmin(RegisterRequest request) {
        String username = request.getUsername().trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        if (userRepository.existsByMobile(request.getMobile())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mobile already exists");
        }

        String uniqueCode = generateUniqueCustomerCode();

        // only SUPERADMIN allowed here
        String requestedRole = (request.getRole() == null || request.getRole().isBlank())
                ? "ROLE_SUPERADMIN"
                : request.getRole().trim().toUpperCase();

        if (!requestedRole.equals("ROLE_SUPERADMIN")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only ROLE_SUPERADMIN allowed in this endpoint");
        }

        Role selectedRole = roleRepository.findByName("ROLE_SUPERADMIN")
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "ROLE_SUPERADMIN missing"));

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setMobile(request.getMobile());
        user.setCustomerCode(uniqueCode);
        user.setEnabled(true);
        if (request.getCity() != null && !request.getCity().isBlank()) {
            user.setCity(request.getCity().trim());
        }

        user.getRoles().add(selectedRole);

        userRepository.save(user);
        logger.info("Registered SUPERADMIN user: {}", user.getUsername());

        return toDto(user);
    }

    @Transactional
    public UserDto register(RegisterRequest request) {
        return registerPublic(request);
    }


}