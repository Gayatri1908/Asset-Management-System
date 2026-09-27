package com.niyati.template.controller;
import com.niyati.template.entity.Maintenance;
import com.niyati.template.service.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/maintenances")
public class MaintenanceController {
    @Autowired private MaintenanceService service;

    @GetMapping
    public ResponseEntity<List<Maintenance>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Maintenance> getById(@PathVariable Long id) {
        Maintenance entity = service.findById(id);
        if (entity == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(entity);
    }

    @PostMapping
    public ResponseEntity<Maintenance> create(@RequestBody Maintenance entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Maintenance> update(@PathVariable Long id, @RequestBody Maintenance entity) {
        Maintenance existing = service.findById(id);
        if (existing == null) return ResponseEntity.notFound().build();
        entity.setId(id);
        return ResponseEntity.ok(service.save(entity));
    }

    @Autowired
    private com.niyati.template.repository.AssetRepository assetRepository;

    @Autowired
    private com.niyati.template.service.ActivityLogService activityLogService;

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        Maintenance existing = service.findById(id);
        if (existing == null) return ResponseEntity.notFound().build();
        
        String newStatus = body.get("status");
        if (newStatus != null) {
            existing.setStatus(newStatus);
            if ("COMPLETED".equalsIgnoreCase(newStatus)) {
                if (existing.getEndDate() == null) {
                    existing.setEndDate(java.time.LocalDate.now());
                }
                if (existing.getAsset() != null) {
                    com.niyati.template.entity.Asset asset = existing.getAsset();
                    asset.setStatus("AVAILABLE");
                    assetRepository.save(asset);

                    com.niyati.template.entity.ActivityLog log = new com.niyati.template.entity.ActivityLog();
                    log.setAction("MAINTENANCE_COMPLETED");
                    log.setDetails("Maintenance ticket #" + id + " completed for asset " + asset.getAssetCode() + " (" + asset.getName() + "). Status restored to AVAILABLE.");
                    activityLogService.save(log);
                }
            }
            service.save(existing);
        }
        return ResponseEntity.ok(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}