package com.niyati.template.dto.request;

public class NewAssetIssueDto {
    private Long assetId;
    private Long employeeId;
    private String expectedReturnDate;
    private String remarks;
    private String conditionAtIssue;

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public String getExpectedReturnDate() { return expectedReturnDate; }
    public void setExpectedReturnDate(String expectedReturnDate) { this.expectedReturnDate = expectedReturnDate; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getConditionAtIssue() { return conditionAtIssue; }
    public void setConditionAtIssue(String conditionAtIssue) { this.conditionAtIssue = conditionAtIssue; }
}
