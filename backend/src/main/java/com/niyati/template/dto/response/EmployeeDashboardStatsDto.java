package com.niyati.template.dto.response;

public class EmployeeDashboardStatsDto {
    private long assignedAssets;
    private long pendingRequests;
    private long returnRequests;
    private long notifications;
    private long complaints;

    public EmployeeDashboardStatsDto(long assignedAssets, long pendingRequests, long returnRequests, long notifications, long complaints) {
        this.assignedAssets = assignedAssets;
        this.pendingRequests = pendingRequests;
        this.returnRequests = returnRequests;
        this.notifications = notifications;
        this.complaints = complaints;
    }

    public long getAssignedAssets() { return assignedAssets; }
    public long getPendingRequests() { return pendingRequests; }
    public long getReturnRequests() { return returnRequests; }
    public long getNotifications() { return notifications; }
    public long getComplaints() { return complaints; }
}
