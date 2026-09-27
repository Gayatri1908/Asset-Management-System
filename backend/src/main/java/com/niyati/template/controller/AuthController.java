package com.niyati.template.controller;

import com.niyati.template.dto.request.LoginRequest;
import com.niyati.template.dto.request.SignupRequest;
import com.niyati.template.dto.response.ApiResponse;
import com.niyati.template.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.niyati.template.dto.request.ChangePasswordRequest;
import com.niyati.template.dto.request.ResetPasswordRequest;
import com.niyati.template.dto.request.ProfileUpdateRequest;
import com.niyati.template.security.UserDetailsImpl;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.Map;

@RestController
@RequestMapping({"/api/auth", "/auth"})
public class AuthController {
    
    @Autowired
    private AuthService authService;

    private Long getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) principal).getId();
        }
        return null;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", authService.authenticateUser(loginRequest)));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        authService.registerUser(signUpRequest);
        return ResponseEntity.ok(new ApiResponse<>(true, "User registered successfully!", null));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthorized", null));
        }
        authService.changePassword(userId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password changed successfully!", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password has been successfully reset!", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String identifier = body.getOrDefault("identifier", body.getOrDefault("email", body.get("username")));
        return ResponseEntity.ok(new ApiResponse<>(true, "Reset instructions generated for " + identifier, null));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthorized", null));
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile retrieved", authService.getProfile(userId)));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequest request) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthorized", null));
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully", authService.updateProfile(userId, request)));
    }
}
