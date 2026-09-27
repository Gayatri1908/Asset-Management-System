package com.niyati.template.service;
import java.util.List;
import com.niyati.template.dto.response.IssuerDashboardStatsDto;
import com.niyati.template.entity.AssetIssue;
import com.niyati.template.entity.Employee;
import com.niyati.template.entity.Asset;
import com.niyati.template.dto.request.NewAssetIssueDto;
import com.niyati.template.entity.AssetRequest;
import com.niyati.template.entity.AssetReturn;
import com.niyati.template.dto.request.ApprovalDto;

public interface IssuerService {
    List<AssetRequest> getPendingRequests();
    AssetRequest processRequest(Long requestId, ApprovalDto approvalDto, Long issuerUserId);
    List<AssetReturn> getPendingReturns();
    IssuerDashboardStatsDto getDashboardStats();
    List<AssetIssue> getIssueHistory();
    List<AssetReturn> getReturnHistory();
    List<Employee> searchEmployees(String query);
    List<Asset> searchAssets(String query);
    AssetIssue directIssueAsset(Long issuerId, NewAssetIssueDto dto);
    AssetReturn directReturnAsset(Long issuerId, Long issueId, String condition, String remarks);
    AssetReturn processReturn(Long returnId, ApprovalDto approvalDto, Long issuerUserId);
}