package com.niyati.template.service.impl;

import com.niyati.template.dto.request.LoginRequest;
import com.niyati.template.dto.request.SignupRequest;
import com.niyati.template.dto.response.JwtResponse;
import com.niyati.template.entity.User;
import com.niyati.template.exception.BadRequestException;
import com.niyati.template.repository.UserRepository;
import com.niyati.template.security.JwtUtils;
import com.niyati.template.security.UserDetailsImpl;
import com.niyati.template.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.niyati.template.dto.request.ChangePasswordRequest;
import com.niyati.template.dto.request.ResetPasswordRequest;
import com.niyati.template.dto.request.ProfileUpdateRequest;
import com.niyati.template.dto.response.UserProfileDto;
import com.niyati.template.entity.Employee;
import com.niyati.template.repository.EmployeeRepository;
import com.niyati.template.exception.ResourceNotFoundException;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    EmployeeRepository employeeRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Override
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return new JwtResponse(jwt, userDetails.getId(), userDetails.getName(), userDetails.getEmail(), userDetails.getRole());
    }

    @Override
    public void registerUser(SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new BadRequestException("Error: Username is already taken!");
        }

        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setName(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail() != null ? signUpRequest.getEmail() : signUpRequest.getUsername() + "@example.com");
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setRole(signUpRequest.getRole() != null ? signUpRequest.getRole() : "ROLE_EMPLOYEE");
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        // If employee role, ensure an Employee profile is created
        if ("ROLE_EMPLOYEE".equals(savedUser.getRole()) || "EMPLOYEE".equals(savedUser.getRole())) {
            Employee emp = new Employee();
            emp.setUser(savedUser);
            emp.setFirstName(savedUser.getName() != null ? savedUser.getName() : savedUser.getUsername());
            emp.setLastName("Staff");
            emp.setEmail(savedUser.getEmail());
            emp.setPhone("+91 98765 00000");
            emp.setDepartment("Engineering");
            emp.setDesignation("Associate Engineer");
            emp.setIsActive(true);
            employeeRepository.save(emp);
        }
    }

    @Override
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!encoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        User user = null;
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            user = userRepository.findByUsername(request.getUsername()).orElse(null);
        }
        if (user == null && request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            user = userRepository.findByEmail(request.getEmail()).orElse(null);
        }

        if (user == null) {
            throw new ResourceNotFoundException("No account found with provided username or email");
        }

        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public UserProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setName(user.getName() != null ? user.getName() : user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setIsActive(user.getIsActive());

        Employee emp = employeeRepository.findByUserId(userId);
        if (emp != null) {
            dto.setDepartment(emp.getDepartment());
            dto.setDesignation(emp.getDesignation());
            if (emp.getPhone() != null && dto.getPhone() == null) {
                dto.setPhone(emp.getPhone());
            }
        }

        return dto;
    }

    @Override
    public UserProfileDto updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        userRepository.save(user);

        Employee emp = employeeRepository.findByUserId(userId);
        if (emp != null) {
            if (request.getName() != null) {
                String[] parts = request.getName().split(" ", 2);
                emp.setFirstName(parts[0]);
                if (parts.length > 1) emp.setLastName(parts[1]);
            }
            if (request.getEmail() != null) emp.setEmail(request.getEmail());
            if (request.getPhone() != null) emp.setPhone(request.getPhone());
            if (request.getDepartment() != null) emp.setDepartment(request.getDepartment());
            if (request.getDesignation() != null) emp.setDesignation(request.getDesignation());
            employeeRepository.save(emp);
        }

        return getProfile(userId);
    }
}
