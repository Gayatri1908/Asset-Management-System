package com.niyati.template.dto.response;

public class DashboardStatsDto {
    private long totalAssets;
    private long availableAssets;
    private long issuedAssets;
    private long totalEmployees;
    private long returnedToday;
    private long pendingReturns;
    private long assetsUnderMaintenance;

    public long getTotalAssets() {
        return totalAssets;
    }

    public void setTotalAssets(long totalAssets) {
        this.totalAssets = totalAssets;
    }

    public long getAvailableAssets() {
        return availableAssets;
    }

    public void setAvailableAssets(long availableAssets) {
        this.availableAssets = availableAssets;
    }

    public long getIssuedAssets() {
        return issuedAssets;
    }

    public void setIssuedAssets(long issuedAssets) {
        this.issuedAssets = issuedAssets;
    }

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public long getReturnedToday() {
        return returnedToday;
    }

    public void setReturnedToday(long returnedToday) {
        this.returnedToday = returnedToday;
    }

    public long getPendingReturns() {
        return pendingReturns;
    }

    public void setPendingReturns(long pendingReturns) {
        this.pendingReturns = pendingReturns;
    }

    public long getAssetsUnderMaintenance() {
        return assetsUnderMaintenance;
    }

    public void setAssetsUnderMaintenance(long assetsUnderMaintenance) {
        this.assetsUnderMaintenance = assetsUnderMaintenance;
    }

    public long getUnderMaintenance() {
        return assetsUnderMaintenance;
    }

    public void setUnderMaintenance(long underMaintenance) {
        this.assetsUnderMaintenance = underMaintenance;
    }

    private long retiredAssets;
    private long pendingRequests;
    private long overdueReturns;

    public long getRetiredAssets() { return retiredAssets; }
    public void setRetiredAssets(long retiredAssets) { this.retiredAssets = retiredAssets; }

    public long getPendingRequests() { return pendingRequests; }
    public void setPendingRequests(long pendingRequests) { this.pendingRequests = pendingRequests; }

    public long getOverdueReturns() { return overdueReturns; }
    public void setOverdueReturns(long overdueReturns) { this.overdueReturns = overdueReturns; }
}
