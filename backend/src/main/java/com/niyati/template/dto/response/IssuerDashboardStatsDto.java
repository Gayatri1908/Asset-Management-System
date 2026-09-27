package com.niyati.template.dto.response;

public class IssuerDashboardStatsDto {
    private long todaysIssues;
    private long todaysReturns;
    private long pendingRequests;
    private long assetsDueToday;
    private long overdueAssets;

    public IssuerDashboardStatsDto(long todaysIssues, long todaysReturns, long pendingRequests, long assetsDueToday, long overdueAssets) {
        this.todaysIssues = todaysIssues;
        this.todaysReturns = todaysReturns;
        this.pendingRequests = pendingRequests;
        this.assetsDueToday = assetsDueToday;
        this.overdueAssets = overdueAssets;
    }

    public long getTodaysIssues() { return todaysIssues; }
    public long getTodaysReturns() { return todaysReturns; }
    public long getPendingRequests() { return pendingRequests; }
    public long getAssetsDueToday() { return assetsDueToday; }
    public long getOverdueAssets() { return overdueAssets; }
}
