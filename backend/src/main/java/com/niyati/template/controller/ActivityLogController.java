package com.niyati.template.controller;
import com.niyati.template.entity.ActivityLog;
import com.niyati.template.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class ActivityLogController {
    @Autowired private ActivityLogService service;

    @GetMapping
    public ResponseEntity<List<ActivityLog>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivityLog> getById(@PathVariable Long id) {
        ActivityLog entity = service.findById(id);
        if (entity == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(entity);
    }

    @PostMapping
    public ResponseEntity<ActivityLog> create(@RequestBody ActivityLog entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActivityLog> update(@PathVariable Long id, @RequestBody ActivityLog entity) {
        ActivityLog existing = service.findById(id);
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