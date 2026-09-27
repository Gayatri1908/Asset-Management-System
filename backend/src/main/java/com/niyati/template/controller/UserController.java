package com.niyati.template.controller;

import com.niyati.template.dto.response.ApiResponse;
import com.niyati.template.entity.User;
import com.niyati.template.entity.Employee;
import com.niyati.template.repository.UserRepository;
import com.niyati.template.repository.EmployeeRepository;
import com.niyati.template.repository.AssetIssueRepository;
import com.niyati.template.repository.AssetReturnRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AssetIssueRepository assetIssueRepository;

    @Autowired
    private AssetReturnRepository assetReturnRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUsers(@RequestParam(required = false) String role) {
        List<User> users;
        if (role != null && !role.trim().isEmpty()) {
            users = userRepository.findByRole(role);
        } else {
            users = userRepository.findAll();
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : users) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("username", u.getUsername());
            map.put("name", u.getName() != null ? u.getName() : u.getUsername());
            map.put("email", u.getEmail());
            map.put("phone", u.getPhone());
            map.put("role", u.getRole());
            map.put("isActive", u.getIsActive());
            map.put("createdAt", u.getCreatedAt());

            if ("ROLE_ASSET_ISSUER".equals(u.getRole()) || "ASSET_ISSUER".equals(u.getRole())) {
                long issuedCount = assetIssueRepository.findAll().stream()
                        .filter(i -> i.getIssuedBy() != null && i.getIssuedBy().getId().equals(u.getId()))
                        .count();
                map.put("activityCount", issuedCount);
            }

            result.add(map);
        }

        return ResponseEntity.ok(new ApiResponse<>(true, "Users retrieved", result));
    }

    @GetMapping("/issuers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getIssuers() {
        return getUsers("ROLE_ASSET_ISSUER");
    }

    @PostMapping("/issuers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createIssuer(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String name = body.get("name");
        String email = body.get("email");
        String password = body.getOrDefault("password", "Admin@123");
        String phone = body.get("phone");

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Username already exists", null));
        }

        User issuer = new User();
        issuer.setUsername(username);
        issuer.setName(name != null ? name : username);
        issuer.setEmail(email != null ? email : username + "@example.com");
        issuer.setPhone(phone);
        issuer.setPassword(passwordEncoder.encode(password));
        issuer.setRole("ROLE_ASSET_ISSUER");
        issuer.setIsActive(true);

        User saved = userRepository.save(issuer);
        return ResponseEntity.ok(new ApiResponse<>(true, "Asset Issuer created successfully", saved));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        user.setIsActive(!user.getIsActive());
        userRepository.save(user);

        // Also update linked employee if applicable
        Employee emp = employeeRepository.findByUserId(id);
        if (emp != null) {
            emp.setIsActive(user.getIsActive());
            employeeRepository.save(emp);
        }

        return ResponseEntity.ok(new ApiResponse<>(true, "Status updated to " + (user.getIsActive() ? "Active" : "Inactive"), user));
    }
}
