package com.niyati.template.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class AssetIssueDto {
    @NotNull(message = "Asset ID is required")
    private Long assetId;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    private LocalDate expectedReturnDate;
    private String conditionAtIssue;
    private String remarks;

    public Long getAssetId() {
        return assetId;
    }

    public void setAssetId(Long assetId) {
        this.assetId = assetId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public LocalDate getExpectedReturnDate() {
        return expectedReturnDate;
    }

    public void setExpectedReturnDate(LocalDate expectedReturnDate) {
        this.expectedReturnDate = expectedReturnDate;
    }

    public String getConditionAtIssue() {
        return conditionAtIssue;
    }

    public void setConditionAtIssue(String conditionAtIssue) {
        this.conditionAtIssue = conditionAtIssue;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

}
