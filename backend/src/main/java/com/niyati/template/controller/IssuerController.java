package com.niyati.template.controller;

import com.niyati.template.entity.AssetRequest;
import com.niyati.template.entity.AssetReturn;
import com.niyati.template.dto.request.ApprovalDto;
import com.niyati.template.security.UserDetailsImpl;
import com.niyati.template.service.IssuerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.niyati.template.dto.response.IssuerDashboardStatsDto;
import com.niyati.template.entity.AssetIssue;
import com.niyati.template.entity.Employee;
import com.niyati.template.entity.Asset;
import com.niyati.template.dto.request.NewAssetIssueDto;
import java.util.Map;


@RestController
@RequestMapping("/api/issuer")
@PreAuthorize("hasRole('ASSET_ISSUER') or hasRole('ADMIN')")

public class IssuerController {

    @Autowired
    private IssuerService issuerService;

    private Long getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping("/requests")
    public ResponseEntity<List<AssetRequest>> getPendingRequests() {
        return ResponseEntity.ok(issuerService.getPendingRequests());
    }

    @PutMapping("/requests/{id}")
    public ResponseEntity<AssetRequest> processRequest(@PathVariable Long id, @RequestBody ApprovalDto dto) {
        return ResponseEntity.ok(issuerService.processRequest(id, dto, getCurrentUserId()));
    }

    @GetMapping("/returns")
    public ResponseEntity<List<AssetReturn>> getPendingReturns() {
        return ResponseEntity.ok(issuerService.getPendingReturns());
    }

    @PutMapping("/returns/{id}")
    public ResponseEntity<AssetReturn> processReturn(@PathVariable Long id, @RequestBody ApprovalDto dto) {
        return ResponseEntity.ok(issuerService.processReturn(id, dto, getCurrentUserId()));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<IssuerDashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(issuerService.getDashboardStats());
    }

    @GetMapping("/history/issues")
    public ResponseEntity<List<AssetIssue>> getIssueHistory() {
        return ResponseEntity.ok(issuerService.getIssueHistory());
    }

    @GetMapping("/history/returns")
    public ResponseEntity<List<AssetReturn>> getReturnHistory() {
        return ResponseEntity.ok(issuerService.getReturnHistory());
    }

    @GetMapping("/search/employees")
    public ResponseEntity<List<Employee>> searchEmployees(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(issuerService.searchEmployees(query));
    }

    @GetMapping("/search/assets")
    public ResponseEntity<List<Asset>> searchAssets(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(issuerService.searchAssets(query));
    }

    @PostMapping("/issue-asset")
    public ResponseEntity<AssetIssue> directIssueAsset(@RequestBody NewAssetIssueDto dto) {
        return ResponseEntity.ok(issuerService.directIssueAsset(getCurrentUserId(), dto));
    }

    @PostMapping("/return-asset/{issueId}")
    public ResponseEntity<AssetReturn> directReturnAsset(@PathVariable Long issueId, @RequestBody Map<String, String> payload) {
        String condition = payload.getOrDefault("condition", payload.getOrDefault("returnCondition", "Good"));
        String remarks = payload.getOrDefault("remarks", "");
        return ResponseEntity.ok(issuerService.directReturnAsset(getCurrentUserId(), issueId, condition, remarks));
    }

    @PostMapping("/return-asset")
    public ResponseEntity<AssetReturn> directReturnAssetWithBody(@RequestBody Map<String, Object> payload) {
        Object issueIdObj = payload.get("issueId");
        Long issueId = issueIdObj != null ? Long.valueOf(issueIdObj.toString()) : null;
        String condition = (String) payload.getOrDefault("returnCondition", payload.getOrDefault("condition", "Good"));
        String remarks = (String) payload.getOrDefault("remarks", "");
        return ResponseEntity.ok(issuerService.directReturnAsset(getCurrentUserId(), issueId, condition, remarks));
    }

}