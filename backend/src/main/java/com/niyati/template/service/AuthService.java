package com.niyati.template.service;

import com.niyati.template.dto.request.LoginRequest;
import com.niyati.template.dto.request.SignupRequest;
import com.niyati.template.dto.response.JwtResponse;

import com.niyati.template.dto.request.ChangePasswordRequest;
import com.niyati.template.dto.request.ResetPasswordRequest;
import com.niyati.template.dto.request.ProfileUpdateRequest;
import com.niyati.template.dto.response.UserProfileDto;

public interface AuthService {
    JwtResponse authenticateUser(LoginRequest loginRequest);
    void registerUser(SignupRequest signUpRequest);
    void changePassword(Long userId, ChangePasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    UserProfileDto getProfile(Long userId);
    UserProfileDto updateProfile(Long userId, ProfileUpdateRequest request);
}
