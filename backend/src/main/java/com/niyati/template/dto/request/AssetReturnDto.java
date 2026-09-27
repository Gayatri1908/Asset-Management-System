package com.niyati.template.dto.request;

import jakarta.validation.constraints.NotNull;
public class AssetReturnDto {
    @NotNull(message = "Issue ID is required")
    private Long issueId;

    private String conditionAtReturn;
    private String remarks;

    public Long getIssueId() {
        return issueId;
    }

    public void setIssueId(Long issueId) {
        this.issueId = issueId;
    }

    public String getConditionAtReturn() {
        return conditionAtReturn;
    }

    public void setConditionAtReturn(String conditionAtReturn) {
        this.conditionAtReturn = conditionAtReturn;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

}
