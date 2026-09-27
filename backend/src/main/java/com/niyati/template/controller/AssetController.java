package com.niyati.template.controller;

import com.niyati.template.dto.request.AssetDto;
import com.niyati.template.dto.response.ApiResponse;
import com.niyati.template.entity.Asset;
import com.niyati.template.service.AssetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    @Autowired
    private AssetService assetService;

    @GetMapping
    public ResponseEntity<?> getAllAssets(Pageable pageable) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Assets retrieved", assetService.getAllAssets(pageable)));
    }
    
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableAssets() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Available assets retrieved", assetService.getAvailableAssets()));
    }

    @Autowired
    private com.niyati.template.repository.AssetRepository assetRepository;

    @Autowired
    private com.niyati.template.repository.AssetIssueRepository assetIssueRepository;

    @Autowired
    private com.niyati.template.repository.MaintenanceRepository maintenanceRepository;

    @GetMapping("/{id}")
    public ResponseEntity<?> getAssetById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Asset retrieved", assetService.getAssetById(id)));
    }

    @GetMapping("/code/{assetCode}")
    public ResponseEntity<?> getAssetByCode(@PathVariable String assetCode) {
        Asset asset = assetRepository.findByAssetCode(assetCode).orElse(null);
        if (asset == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Asset found by code", asset));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<?> getAssetHistory(@PathVariable Long id) {
        java.util.Map<String, Object> history = new java.util.HashMap<>();
        history.put("issues", assetIssueRepository.findByAssetId(id));
        history.put("maintenances", maintenanceRepository.findByAssetId(id));
        return ResponseEntity.ok(new ApiResponse<>(true, "Asset history retrieved", history));
    }

    @PostMapping
    public ResponseEntity<?> createAsset(@Valid @RequestBody AssetDto assetDto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Asset created successfully", assetService.createAsset(assetDto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAsset(@PathVariable Long id, @Valid @RequestBody AssetDto assetDto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Asset updated successfully", assetService.updateAsset(id, assetDto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Asset deleted successfully", null));
    }
}
