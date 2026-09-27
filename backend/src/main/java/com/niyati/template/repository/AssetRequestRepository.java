package com.niyati.template.repository;
import com.niyati.template.entity.AssetRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssetRequestRepository extends JpaRepository<AssetRequest, Long> {
    List<AssetRequest> findByStatus(String status);
    List<AssetRequest> findByEmployeeId(Long employeeId);
}