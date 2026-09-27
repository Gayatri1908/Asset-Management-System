package com.niyati.template.service.impl;

import com.niyati.template.dto.request.AssetDto;
import com.niyati.template.entity.Asset;
import com.niyati.template.exception.BadRequestException;
import com.niyati.template.exception.ResourceNotFoundException;
import com.niyati.template.repository.AssetRepository;
import com.niyati.template.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssetServiceImpl implements AssetService {

    @Autowired
    private AssetRepository assetRepository;

    @Override
    public Page<Asset> getAllAssets(Pageable pageable) {
        return assetRepository.findAll(pageable);
    }

    @Override
    public Asset getAssetById(Long id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));
    }

    @Override
    public Asset createAsset(AssetDto assetDto) {
        if (assetRepository.existsByAssetCode(assetDto.getAssetCode())) {
            throw new BadRequestException("Asset code already exists: " + assetDto.getAssetCode());
        }

        Asset asset = new Asset();
        mapDtoToEntity(assetDto, asset);
        asset.setStatus("AVAILABLE"); // default status
        return assetRepository.save(asset);
    }

    @Override
    public Asset updateAsset(Long id, AssetDto assetDto) {
        Asset asset = getAssetById(id);
        
        if (!asset.getAssetCode().equals(assetDto.getAssetCode()) && 
            assetRepository.existsByAssetCode(assetDto.getAssetCode())) {
            throw new BadRequestException("Asset code already exists: " + assetDto.getAssetCode());
        }

        mapDtoToEntity(assetDto, asset);
        return assetRepository.save(asset);
    }

    @Override
    public void deleteAsset(Long id) {
        Asset asset = getAssetById(id);
        assetRepository.delete(asset);
    }

    @Override
    public List<Asset> getAvailableAssets() {
        return assetRepository.findAll().stream()
                .filter(a -> "AVAILABLE".equals(a.getStatus()))
                .toList();
    }

    private void mapDtoToEntity(AssetDto dto, Asset entity) {
        entity.setAssetCode(dto.getAssetCode());
        entity.setName(dto.getName());
        entity.setCategory(dto.getCategory());
        entity.setBrand(dto.getBrand());
        entity.setSerialNumber(dto.getSerialNumber());
        entity.setPurchasePrice(dto.getPurchasePrice());
        entity.setLocation(dto.getLocation());
        entity.setRemarks(dto.getRemarks());
        if (dto.getQuantity() != null) entity.setQuantity(dto.getQuantity());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
    }
}
