package com.niyati.template.repository;
import com.niyati.template.entity.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    java.util.List<Maintenance> findByAssetId(Long assetId);
}