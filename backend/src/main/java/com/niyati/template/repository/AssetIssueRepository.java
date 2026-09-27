package com.niyati.template.repository;
import com.niyati.template.entity.AssetIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssetIssueRepository extends JpaRepository<AssetIssue, Long> {
    List<AssetIssue> findByEmployeeId(Long employeeId);
    long countByIssueStatus(String status);
    long countByActualReturnDateBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
    List<AssetIssue> findByAssetId(Long assetId);
}