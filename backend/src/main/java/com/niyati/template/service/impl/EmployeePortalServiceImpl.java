package com.niyati.template.service.impl;

import com.niyati.template.entity.*;
import com.niyati.template.dto.request.*;
import com.niyati.template.repository.*;
import com.niyati.template.service.EmployeePortalService;
import com.niyati.template.service.NotificationService;
import com.niyati.template.exception.ResourceNotFoundException;
import com.niyati.template.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.niyati.template.dto.response.EmployeeDashboardStatsDto;


import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeePortalServiceImpl implements EmployeePortalService {
    @Autowired
    private AssetRepository assetRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AssetRequestRepository assetRequestRepository;

    @Autowired
    private AssetIssueRepository assetIssueRepository;
    
    @Autowired
    private AssetReturnRepository assetReturnRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.niyati.template.service.ActivityLogService activityLogService;

    private Employee getEmployeeByUserId(Long userId) {
        Employee employee = employeeRepository.findByUserId(userId);
        if (employee == null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                employee = new Employee();
                employee.setUser(user);
                employee.setFirstName(user.getName() != null ? user.getName() : user.getUsername());
                employee.setLastName("Staff");
                employee.setEmail(user.getEmail() != null ? user.getEmail() : user.getUsername() + "@aims.in");
                employee.setPhone(user.getPhone() != null ? user.getPhone() : "+91 98765 00000");
                employee.setDepartment("Engineering");
                employee.setDesignation("Software Engineer");
                employee.setIsActive(true);
                return employeeRepository.save(employee);
            }
            throw new ResourceNotFoundException("Employee profile not found for user");
        }
        return employee;
    }

    @Override
    public List<Asset> getAvailableAssets() {
        return assetRepository.findAll().stream()
                .filter(asset -> "AVAILABLE".equals(asset.getStatus()))
                .collect(Collectors.toList());
    }

    @Override
    public AssetRequest requestAsset(Long userId, NewAssetRequestDto dto) {
        Employee employee = getEmployeeByUserId(userId);
        Asset asset = assetRepository.findById(dto.getAssetId())
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
            
        if (!"AVAILABLE".equals(asset.getStatus())) {
            throw new BadRequestException("Asset is not available for request");
        }

        AssetRequest request = new AssetRequest();
        request.setEmployee(employee);
        request.setAsset(asset);
        request.setRemarks(dto.getRemarks());
        return assetRequestRepository.save(request);
    }

    @Override
    public List<AssetIssue> getMyAssets(Long userId) {
        Employee employee = getEmployeeByUserId(userId);
        return assetIssueRepository.findByEmployeeId(employee.getId());
    }

    @Override
    public AssetReturn returnAsset(Long userId, NewAssetReturnDto dto) {
        Employee employee = getEmployeeByUserId(userId);
        AssetIssue issue = assetIssueRepository.findById(dto.getIssueId())
            .orElseThrow(() -> new ResourceNotFoundException("AssetIssue not found"));

        if (!issue.getEmployee().getId().equals(employee.getId())) {
            throw new BadRequestException("This issue does not belong to you");
        }
        
        if (!"ISSUED".equals(issue.getIssueStatus())) {
            throw new BadRequestException("Asset is already returned or not issued");
        }

        AssetReturn assetReturn = new AssetReturn();
        assetReturn.setIssue(issue);
        assetReturn.setReturnCondition(dto.getReturnCondition());
        assetReturn.setRemarks(dto.getRemarks());
        return assetReturnRepository.save(assetReturn);
    }

    @Override
    public Complaint fileComplaint(Long userId, NewComplaintDto dto) {
        Employee employee = getEmployeeByUserId(userId);
        Asset asset = assetRepository.findById(dto.getAssetId())
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));

        Complaint complaint = new Complaint();
        complaint.setEmployee(employee);
        complaint.setAsset(asset);
        complaint.setSubject(dto.getSubject());
        complaint.setDescription(dto.getDescription());
        complaint.setPriority(dto.getPriority());
        return complaintRepository.save(complaint);
    }

    @Override
    public List<AssetRequest> getMyRequests(Long userId) {
        Employee employee = getEmployeeByUserId(userId);
        return assetRequestRepository.findByEmployeeId(employee.getId());
    }

    @Override
    public List<Complaint> getMyComplaints(Long userId) {
        Employee employee = getEmployeeByUserId(userId);
        return complaintRepository.findByEmployeeId(employee.getId());
    }

    @Override
    public EmployeeDashboardStatsDto getDashboardStats(Long userId) {
        Employee employee = getEmployeeByUserId(userId);
        
        long assignedAssets = assetIssueRepository.findByEmployeeId(employee.getId()).stream()
            .filter(i -> "ISSUED".equals(i.getIssueStatus())).count();
            
        long pendingRequests = assetRequestRepository.findByEmployeeId(employee.getId()).stream()
            .filter(r -> "PENDING".equals(r.getStatus())).count();
            
        long returnRequests = assetReturnRepository.findAll().stream()
            .filter(r -> r.getIssue().getEmployee().getId().equals(employee.getId()) && "PENDING".equals(r.getStatus()))
            .count();
            
        long complaints = complaintRepository.findByEmployeeId(employee.getId()).size();
        
        long notifications = 0; // if notification logic applies to employee
        
        return new EmployeeDashboardStatsDto(assignedAssets, pendingRequests, returnRequests, notifications, complaints);
    }

}