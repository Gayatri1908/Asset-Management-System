package com.niyati.template.controller;
import com.niyati.template.entity.AssetCategory;
import com.niyati.template.service.AssetCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class AssetCategoryController {
    @Autowired private AssetCategoryService service;

    @GetMapping
    public ResponseEntity<List<AssetCategory>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetCategory> getById(@PathVariable Long id) {
        AssetCategory entity = service.findById(id);
        if (entity == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(entity);
    }

    @PostMapping
    public ResponseEntity<AssetCategory> create(@RequestBody AssetCategory entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssetCategory> update(@PathVariable Long id, @RequestBody AssetCategory entity) {
        AssetCategory existing = service.findById(id);
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