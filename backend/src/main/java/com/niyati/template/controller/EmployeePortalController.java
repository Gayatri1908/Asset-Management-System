package com.niyati.template.controller;

import com.niyati.template.entity.*;
import com.niyati.template.dto.request.*;
import com.niyati.template.security.UserDetailsImpl;
import com.niyati.template.service.EmployeePortalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.niyati.template.dto.response.EmployeeDashboardStatsDto;

@RestController
@RequestMapping("/api/employee")
@PreAuthorize("hasRole('EMPLOYEE')")

public class EmployeePortalController {

    @Autowired
    private EmployeePortalService employeePortalService;

    private Long getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping("/assets")
    public ResponseEntity<List<Asset>> getAvailableAssets() {
        return ResponseEntity.ok(employeePortalService.getAvailableAssets());
    }

    @GetMapping("/issued-assets")
    public ResponseEntity<List<AssetIssue>> getMyAssets() {
        return ResponseEntity.ok(employeePortalService.getMyAssets(getCurrentUserId()));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<AssetRequest>> getMyRequests() {
        return ResponseEntity.ok(employeePortalService.getMyRequests(getCurrentUserId()));
    }

    @PostMapping("/requests")
    public ResponseEntity<AssetRequest> requestAsset(@RequestBody NewAssetRequestDto dto) {
        return ResponseEntity.ok(employeePortalService.requestAsset(getCurrentUserId(), dto));
    }

    @PostMapping("/returns")
    public ResponseEntity<AssetReturn> returnAsset(@RequestBody NewAssetReturnDto dto) {
        return ResponseEntity.ok(employeePortalService.returnAsset(getCurrentUserId(), dto));
    }
    
    @GetMapping("/complaints")
    public ResponseEntity<List<Complaint>> getMyComplaints() {
        return ResponseEntity.ok(employeePortalService.getMyComplaints(getCurrentUserId()));
    }

    @PostMapping("/complaints")
    public ResponseEntity<Complaint> fileComplaint(@RequestBody NewComplaintDto dto) {
        return ResponseEntity.ok(employeePortalService.fileComplaint(getCurrentUserId(), dto));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<EmployeeDashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(employeePortalService.getDashboardStats(getCurrentUserId()));
    }

}