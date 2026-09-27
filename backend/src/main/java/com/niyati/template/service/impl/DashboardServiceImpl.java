package com.niyati.template.service.impl;

import com.niyati.template.dto.response.DashboardStatsDto;
import com.niyati.template.repository.AssetIssueRepository;
import com.niyati.template.repository.AssetRepository;
import com.niyati.template.repository.EmployeeRepository;
import com.niyati.template.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AssetIssueRepository assetIssueRepository;

    @Autowired
    private com.niyati.template.repository.AssetRequestRepository assetRequestRepository;

    @Override
    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();
        
        stats.setTotalAssets(assetRepository.count());
        stats.setAvailableAssets(assetRepository.countByStatus("AVAILABLE"));
        stats.setIssuedAssets(assetRepository.countByStatus("ISSUED"));
        stats.setAssetsUnderMaintenance(assetRepository.countByStatus("MAINTENANCE"));
        stats.setRetiredAssets(assetRepository.countByStatus("RETIRED"));
        
        stats.setTotalEmployees(employeeRepository.countByIsActiveTrue());
        
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);
        stats.setReturnedToday(assetIssueRepository.countByActualReturnDateBetween(startOfDay, endOfDay));
        
        stats.setPendingReturns(assetIssueRepository.countByIssueStatus("ISSUED"));
        stats.setPendingRequests(assetRequestRepository.findByStatus("PENDING").size());

        LocalDate today = LocalDate.now();
        long overdue = assetIssueRepository.findAll().stream()
                .filter(i -> "ISSUED".equals(i.getIssueStatus()) && i.getExpectedReturnDate() != null && i.getExpectedReturnDate().isBefore(today))
                .count();
        stats.setOverdueReturns(overdue);

        return stats;
    }
}
