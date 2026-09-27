package com.niyati.template.service;

import com.niyati.template.dto.request.AssetIssueDto;
import com.niyati.template.dto.request.AssetReturnDto;
import com.niyati.template.entity.AssetIssue;
import java.util.List;

public interface AssetIssueService {
    AssetIssue issueAsset(AssetIssueDto dto, String username);
    AssetIssue returnAsset(AssetReturnDto dto);
    List<AssetIssue> getIssueHistory();
    List<AssetIssue> getPendingReturns();
}
