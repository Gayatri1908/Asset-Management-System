package com.niyati.template.service;
import com.niyati.template.entity.Maintenance;
import com.niyati.template.repository.MaintenanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@Service
public class MaintenanceService {
    @Autowired private MaintenanceRepository repository;

    public List<Maintenance> findAll() { return repository.findAll(); }
    public Maintenance findById(Long id) { return repository.findById(id).orElse(null); }
    public Maintenance save(Maintenance entity) { return repository.save(entity); }
    public void deleteById(Long id) { repository.deleteById(id); }
}