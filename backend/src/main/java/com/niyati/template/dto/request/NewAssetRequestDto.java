package com.niyati.template.dto.request;
public class NewAssetRequestDto {
    private Long assetId;
    private String remarks;
    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}