package com.niyati.template.repository;

import com.niyati.template.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long>, JpaSpecificationExecutor<Asset> {
    Optional<Asset> findByAssetCode(String assetCode);
    Boolean existsByAssetCode(String assetCode);
    long countByStatus(String status);
}
