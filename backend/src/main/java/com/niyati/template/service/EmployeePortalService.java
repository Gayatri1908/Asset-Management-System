package com.niyati.template.service;
import java.util.List;
import com.niyati.template.dto.response.EmployeeDashboardStatsDto;
import com.niyati.template.entity.Asset;
import com.niyati.template.entity.AssetRequest;
import com.niyati.template.entity.AssetIssue;
import com.niyati.template.entity.AssetReturn;
import com.niyati.template.entity.Complaint;
import com.niyati.template.dto.request.NewAssetRequestDto;
import com.niyati.template.dto.request.NewAssetReturnDto;
import com.niyati.template.dto.request.NewComplaintDto;

public interface EmployeePortalService {
    List<Asset> getAvailableAssets();
    AssetRequest requestAsset(Long userId, NewAssetRequestDto dto);
    List<AssetIssue> getMyAssets(Long userId);
    AssetReturn returnAsset(Long userId, NewAssetReturnDto dto);
    Complaint fileComplaint(Long userId, NewComplaintDto dto);
    List<AssetRequest> getMyRequests(Long userId);
    List<Complaint> getMyComplaints(Long userId);
    EmployeeDashboardStatsDto getDashboardStats(Long userId);
}