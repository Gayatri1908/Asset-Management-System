package com.niyati.template.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "asset_returns")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AssetReturn {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "issue_id", nullable = false)
    private AssetIssue issue;

    private String status = "PENDING";
    private String returnCondition;
    private String remarks;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AssetIssue getIssue() { return issue; }
    public void setIssue(AssetIssue issue) { this.issue = issue; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReturnCondition() { return returnCondition; }
    public void setReturnCondition(String returnCondition) { this.returnCondition = returnCondition; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
