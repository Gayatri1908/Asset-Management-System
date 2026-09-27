package com.niyati.template.dto.request;
public class NewAssetReturnDto {
    private Long issueId;
    private String returnCondition;
    private String remarks;
    public Long getIssueId() { return issueId; }
    public void setIssueId(Long issueId) { this.issueId = issueId; }
    public String getReturnCondition() { return returnCondition; }
    public void setReturnCondition(String returnCondition) { this.returnCondition = returnCondition; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}