package com.niyati.template.controller;
import com.niyati.template.entity.PurchaseRecord;
import com.niyati.template.service.PurchaseRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseRecordController {
    @Autowired private PurchaseRecordService service;

    @GetMapping
    public ResponseEntity<List<PurchaseRecord>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseRecord> getById(@PathVariable Long id) {
        PurchaseRecord entity = service.findById(id);
        if (entity == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(entity);
    }

    @PostMapping
    public ResponseEntity<PurchaseRecord> create(@RequestBody PurchaseRecord entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseRecord> update(@PathVariable Long id, @RequestBody PurchaseRecord entity) {
        PurchaseRecord existing = service.findById(id);
        if (existing == null) return ResponseEntity.notFound().build();
        entity.setId(id);
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}