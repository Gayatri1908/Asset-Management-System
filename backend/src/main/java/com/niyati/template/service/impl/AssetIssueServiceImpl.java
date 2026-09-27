package com.niyati.template.service.impl;

import com.niyati.template.dto.request.AssetIssueDto;
import com.niyati.template.dto.request.AssetReturnDto;
import com.niyati.template.entity.Asset;
import com.niyati.template.entity.AssetIssue;
import com.niyati.template.entity.Employee;
import com.niyati.template.entity.User;
import com.niyati.template.exception.BadRequestException;
import com.niyati.template.exception.ResourceNotFoundException;
import com.niyati.template.repository.AssetIssueRepository;
import com.niyati.template.repository.AssetRepository;
import com.niyati.template.repository.EmployeeRepository;
import com.niyati.template.repository.UserRepository;
import com.niyati.template.service.AssetIssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssetIssueServiceImpl implements AssetIssueService {

    @Autowired
    private AssetIssueRepository issueRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public AssetIssue issueAsset(AssetIssueDto dto, String username) {
        Asset asset = assetRepository.findById(dto.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
        
        if (!"AVAILABLE".equals(asset.getStatus())) {
            throw new BadRequestException("Asset is not available for issue. Current status: " + asset.getStatus());
        }

        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AssetIssue issue = new AssetIssue();
        issue.setAsset(asset);
        issue.setEmployee(employee);
        issue.setIssuedBy(user);
        issue.setExpectedReturnDate(dto.getExpectedReturnDate());
        issue.setConditionAtIssue(dto.getConditionAtIssue());
        issue.setRemarks(dto.getRemarks());
        issue.setIssueStatus("ISSUED");

        asset.setStatus("ISSUED");
        assetRepository.save(asset);

        return issueRepository.save(issue);
    }

    @Override
    @Transactional
    public AssetIssue returnAsset(AssetReturnDto dto) {
        AssetIssue issue = issueRepository.findById(dto.getIssueId())
                .orElseThrow(() -> new ResourceNotFoundException("Issue record not found"));

        if ("RETURNED".equals(issue.getIssueStatus())) {
            throw new BadRequestException("Asset is already returned");
        }

        issue.setIssueStatus("RETURNED");
        issue.setActualReturnDate(LocalDateTime.now());
        issue.setConditionAtReturn(dto.getConditionAtReturn());
        if (dto.getRemarks() != null) {
            issue.setRemarks(issue.getRemarks() + " | Return notes: " + dto.getRemarks());
        }

        Asset asset = issue.getAsset();
        asset.setStatus("AVAILABLE");
        assetRepository.save(asset);

        return issueRepository.save(issue);
    }

    @Override
    public List<AssetIssue> getIssueHistory() {
        return issueRepository.findAll();
    }

    @Override
    public List<AssetIssue> getPendingReturns() {
        return issueRepository.findAll().stream()
                .filter(i -> "ISSUED".equals(i.getIssueStatus()))
                .collect(Collectors.toList());
    }
}
