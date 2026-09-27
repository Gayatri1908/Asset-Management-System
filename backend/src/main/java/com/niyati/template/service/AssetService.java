package com.niyati.template.service;

import com.niyati.template.dto.request.AssetDto;
import com.niyati.template.entity.Asset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface AssetService {
    Page<Asset> getAllAssets(Pageable pageable);

    Asset getAssetById(Long id);

    Asset createAsset(AssetDto assetDto);

    Asset updateAsset(Long id, AssetDto assetDto);

    void deleteAsset(Long id);

    List<Asset> getAvailableAssets();
}