package com.example.project.users.service;



import com.example.project.profile.changepassword.ChangePasswordRequest;
import com.example.project.users.dto.*;

import java.util.List;

public interface UserService {
    UserDto registerPublic(RegisterRequest request);
    UserDto registerSuperAdmin(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserDto me();
    UserDto changePassword(ChangePasswordRequest request);
    UserDto updateProfile(String username, UpdateProfileRequest request);
    public UserDto getCurrentUser(String username);
    List<UserDto> getAllUsers();
    List<UserDto> getUsersByRole(String roleName);
    UserDto toggleUserEnabled(Long userId);
    UserDto getUserById(Long userId);
    void deleteUser(Long userId);
}
