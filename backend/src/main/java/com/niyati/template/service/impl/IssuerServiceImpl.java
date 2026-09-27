package com.niyati.template.service.impl;

import com.niyati.template.entity.*;
import com.niyati.template.dto.request.ApprovalDto;
import com.niyati.template.repository.*;
import com.niyati.template.service.IssuerService;
import com.niyati.template.service.NotificationService;
import com.niyati.template.exception.ResourceNotFoundException;
import com.niyati.template.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.niyati.template.dto.response.IssuerDashboardStatsDto;
import com.niyati.template.entity.AssetIssue;
import com.niyati.template.entity.Employee;
import com.niyati.template.entity.Asset;
import com.niyati.template.dto.request.NewAssetIssueDto;
import com.niyati.template.repository.AssetIssueRepository;
import com.niyati.template.repository.EmployeeRepository;
import com.niyati.template.repository.AssetRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;


import java.util.List;
import java.time.LocalDateTime;

@Service
public class IssuerServiceImpl implements IssuerService {
    @Autowired
    private AssetRequestRepository assetRequestRepository;
    
    @Autowired
    private AssetReturnRepository assetReturnRepository;

    @Autowired
    private AssetIssueRepository assetIssueRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    @Autowired
    private com.niyati.template.service.ActivityLogService activityLogService;

    @Override
    public List<AssetRequest> getPendingRequests() {
        return assetRequestRepository.findByStatus("PENDING");
    }

    @Override
    public AssetRequest processRequest(Long requestId, ApprovalDto approvalDto, Long issuerUserId) {
        AssetRequest request = assetRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("AssetRequest not found"));
            
        User issuer = userRepository.findById(issuerUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Issuer user not found"));

        if (!"PENDING".equals(request.getStatus())) {
            throw new BadRequestException("Request is already processed");
        }

        request.setStatus(approvalDto.getStatus());
        request.setRemarks(approvalDto.getRemarks());
        
        assetRequestRepository.save(request);
        if (request.getEmployee() != null && request.getEmployee().getUser() != null) {
            notificationService.createNotification(request.getEmployee().getUser().getId(), "Your asset request for " + request.getAsset().getName() + " has been " + approvalDto.getStatus());
        }
        
        if ("APPROVED".equals(approvalDto.getStatus())) {
            Asset asset = request.getAsset();
            if (asset != null && "AVAILABLE".equals(asset.getStatus())) {
                asset.setStatus("ISSUED");
                assetRepository.save(asset);

                AssetIssue issue = new AssetIssue();
                issue.setAsset(asset);
                issue.setEmployee(request.getEmployee());
                issue.setIssuedBy(issuer);
                issue.setIssueDate(LocalDateTime.now());
                issue.setExpectedReturnDate(LocalDate.now().plusWeeks(2));
                issue.setConditionAtIssue("Good");
                issue.setRemarks("Issued via approved request #" + requestId + (approvalDto.getRemarks() != null ? " - " + approvalDto.getRemarks() : ""));
                issue.setIssueStatus("ISSUED");
                assetIssueRepository.save(issue);
            }
        }

        ActivityLog log = new ActivityLog();
        log.setUser(issuer);
        log.setAction("PROCESS_REQUEST");
        log.setDetails("Request #" + requestId + " for asset " + request.getAsset().getName() + " was " + approvalDto.getStatus() + " by " + (issuer != null ? issuer.getName() : "Issuer"));
        activityLogService.save(log);

        return request;
    }

    @Override
    public List<AssetReturn> getPendingReturns() {
        return assetReturnRepository.findByStatus("PENDING");
    }

    @Override
    public AssetReturn processReturn(Long returnId, ApprovalDto approvalDto, Long issuerUserId) {
        AssetReturn assetReturn = assetReturnRepository.findById(returnId)
            .orElseThrow(() -> new ResourceNotFoundException("AssetReturn not found"));

        User issuer = userRepository.findById(issuerUserId).orElse(null);

        if (!"PENDING".equals(assetReturn.getStatus())) {
            throw new BadRequestException("Return is already processed");
        }

        assetReturn.setStatus(approvalDto.getStatus());
        
        if ("APPROVED".equals(approvalDto.getStatus())) {
            AssetIssue issue = assetReturn.getIssue();
            issue.setIssueStatus("RETURNED");
            issue.setActualReturnDate(LocalDateTime.now());
            issue.setConditionAtReturn(assetReturn.getReturnCondition());
            assetIssueRepository.save(issue);

            Asset asset = issue.getAsset();
            String cond = assetReturn.getReturnCondition();
            if (cond != null && (cond.equalsIgnoreCase("DAMAGED") || cond.toLowerCase().contains("damage") || cond.equalsIgnoreCase("MAINTENANCE"))) {
                asset.setStatus("MAINTENANCE");
                com.niyati.template.entity.Maintenance m = new com.niyati.template.entity.Maintenance();
                m.setAsset(asset);
                m.setDescription("Reported damaged upon return: " + (assetReturn.getRemarks() != null ? assetReturn.getRemarks() : "Hardware issue"));
                m.setStartDate(LocalDate.now());
                m.setStatus("SCHEDULED");
                m.setCost(new java.math.BigDecimal("0.00"));
                maintenanceRepository.save(m);
            } else {
                asset.setStatus("AVAILABLE");
            }
            assetRepository.save(asset);

            ActivityLog log = new ActivityLog();
            log.setUser(issuer);
            log.setAction("PROCESS_RETURN");
            log.setDetails("Processed return for asset " + asset.getAssetCode() + " (" + asset.getName() + ") - Condition: " + assetReturn.getReturnCondition() + " -> Status: " + asset.getStatus());
            activityLogService.save(log);
        }

        assetReturnRepository.save(assetReturn);
        if (assetReturn.getIssue() != null && assetReturn.getIssue().getEmployee() != null && assetReturn.getIssue().getEmployee().getUser() != null) {
            notificationService.createNotification(assetReturn.getIssue().getEmployee().getUser().getId(), "Your asset return for " + assetReturn.getIssue().getAsset().getName() + " has been " + approvalDto.getStatus());
        }
        return assetReturn;
    }

    @Override
    public IssuerDashboardStatsDto getDashboardStats() {
        long todaysIssues = 0; // TODO implement specific date logic
        long todaysReturns = 0;
        long pendingReqs = assetRequestRepository.findByStatus("PENDING").size();
        long pendingRets = assetReturnRepository.findByStatus("PENDING").size();
        long assetsDueToday = 0;
        long overdueAssets = 0;
        
        List<AssetIssue> allIssues = assetIssueRepository.findAll();
        LocalDate today = LocalDate.now();
        for(AssetIssue issue : allIssues) {
            if ("ISSUED".equals(issue.getIssueStatus())) {
                if (issue.getIssueDate() != null && issue.getIssueDate().toLocalDate().isEqual(today)) todaysIssues++;
                
                if (issue.getExpectedReturnDate() != null) {
                    LocalDate expected = issue.getExpectedReturnDate();
                    if (expected.isEqual(today)) assetsDueToday++;
                    if (expected.isBefore(today)) overdueAssets++;
                }
            }
        }
        
        List<AssetReturn> allReturns = assetReturnRepository.findAll();
        for(AssetReturn ret : allReturns) {
            if ("APPROVED".equals(ret.getStatus())) {
                if (ret.getUpdatedAt() != null && ret.getUpdatedAt().toLocalDate().isEqual(today)) todaysReturns++;
            }
        }
        
        return new IssuerDashboardStatsDto(todaysIssues, todaysReturns, pendingReqs, assetsDueToday, overdueAssets);
    }

    @Override
    public List<AssetIssue> getIssueHistory() {
        return assetIssueRepository.findAll();
    }

    @Override
    public List<AssetReturn> getReturnHistory() {
        return assetReturnRepository.findAll();
    }

    @Override
    public List<Employee> searchEmployees(String query) {
        if (query == null || query.trim().isEmpty()) return employeeRepository.findAll();
        return employeeRepository.findAll().stream()
            .filter(e -> (e.getUser() != null && e.getUser().getName().toLowerCase().contains(query.toLowerCase())) ||
                         (e.getEmail() != null && e.getEmail().toLowerCase().contains(query.toLowerCase())))
            .toList();
    }

    @Override
    public List<Asset> searchAssets(String query) {
        if (query == null || query.trim().isEmpty()) return assetRepository.findAll();
        return assetRepository.findAll().stream()
            .filter(a -> a.getName().toLowerCase().contains(query.toLowerCase()) ||
                         a.getAssetCode().toLowerCase().contains(query.toLowerCase()))
            .toList();
    }

    @Override
    public AssetIssue directIssueAsset(Long issuerId, NewAssetIssueDto dto) {
        Asset asset = assetRepository.findById(dto.getAssetId()).orElseThrow(() -> new RuntimeException("Asset not found"));
        Employee emp = employeeRepository.findById(dto.getEmployeeId()).orElseThrow(() -> new RuntimeException("Employee not found"));
        
        if (!"AVAILABLE".equals(asset.getStatus())) {
            throw new RuntimeException("Asset is not available");
        }
        
        asset.setStatus("ISSUED");
        assetRepository.save(asset);
        
        User issuer = userRepository.findById(issuerId).orElse(null);

        AssetIssue issue = new AssetIssue();
        issue.setAsset(asset);
        issue.setEmployee(emp);
        issue.setIssuedBy(issuer);
        issue.setIssueDate(LocalDateTime.now());
        if(dto.getExpectedReturnDate() != null && !dto.getExpectedReturnDate().isEmpty()){
            try {
                issue.setExpectedReturnDate(LocalDate.parse(dto.getExpectedReturnDate().split("T")[0]));
            } catch (Exception e) {}
        }
        issue.setConditionAtIssue(dto.getConditionAtIssue() != null ? dto.getConditionAtIssue() : "Good");
        issue.setRemarks(dto.getRemarks());
        issue.setIssueStatus("ISSUED");
        
        AssetIssue savedIssue = assetIssueRepository.save(issue);

        // Update any matching requests for this employee and asset
        try {
            List<AssetRequest> requests = assetRequestRepository.findByEmployeeId(emp.getId());
            for (AssetRequest r : requests) {
                if (r.getAsset() != null && r.getAsset().getId().equals(asset.getId()) &&
                    ("APPROVED".equals(r.getStatus()) || "PENDING".equals(r.getStatus()))) {
                    r.setStatus("ISSUED");
                    assetRequestRepository.save(r);
                }
            }
        } catch (Exception ignored) {}

        ActivityLog log = new ActivityLog();
        log.setUser(issuer);
        log.setAction("ISSUE_ASSET");
        log.setDetails("Issued " + asset.getName() + " (" + asset.getAssetCode() + ") to employee " + emp.getFirstName() + " " + emp.getLastName());
        activityLogService.save(log);

        if (emp.getUser() != null) {
            notificationService.createNotification(emp.getUser().getId(), "Asset " + asset.getName() + " (" + asset.getAssetCode() + ") has been issued to you. Due date: " + (issue.getExpectedReturnDate() != null ? issue.getExpectedReturnDate().toString() : "Not specified"));
        }

        return savedIssue;
    }

    @Override
    public AssetReturn directReturnAsset(Long issuerId, Long issueId, String condition, String remarks) {
        AssetIssue issue = assetIssueRepository.findById(issueId).orElseThrow(() -> new RuntimeException("Issue not found"));
        
        if (!"ISSUED".equals(issue.getIssueStatus())) {
            throw new RuntimeException("Asset is not currently issued");
        }
        
        issue.setIssueStatus("RETURNED");
        issue.setActualReturnDate(LocalDateTime.now());
        issue.setConditionAtReturn(condition);
        assetIssueRepository.save(issue);
        
        Asset asset = issue.getAsset();
        if (condition != null && (condition.equalsIgnoreCase("DAMAGED") || condition.toLowerCase().contains("damage") || condition.equalsIgnoreCase("MAINTENANCE"))) {
            asset.setStatus("MAINTENANCE");
            Maintenance m = new Maintenance();
            m.setAsset(asset);
            m.setDescription("Reported damaged upon physical inspection by issuer: " + remarks);
            m.setStartDate(LocalDate.now());
            m.setStatus("SCHEDULED");
            m.setCost(new java.math.BigDecimal("0.00"));
            maintenanceRepository.save(m);
        } else {
            asset.setStatus("AVAILABLE");
        }
        assetRepository.save(asset);
        
        AssetReturn ret = new AssetReturn();
        ret.setIssue(issue);
        ret.setReturnCondition(condition);
        ret.setRemarks(remarks);
        ret.setStatus("APPROVED");
        AssetReturn savedReturn = assetReturnRepository.save(ret);

        User issuer = userRepository.findById(issuerId).orElse(null);
        ActivityLog log = new ActivityLog();
        log.setUser(issuer);
        log.setAction("RETURN_ASSET");
        log.setDetails("Received return for " + asset.getName() + " (" + asset.getAssetCode() + ") from " + issue.getEmployee().getFirstName() + " - Condition: " + condition + " -> Status: " + asset.getStatus());
        activityLogService.save(log);

        if (issue.getEmployee() != null && issue.getEmployee().getUser() != null) {
            notificationService.createNotification(issue.getEmployee().getUser().getId(), "Asset " + asset.getName() + " (" + asset.getAssetCode() + ") return processed successfully.");
        }

        return savedReturn;
    }

}