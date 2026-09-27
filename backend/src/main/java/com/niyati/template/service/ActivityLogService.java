package com.niyati.template.service;
import com.niyati.template.entity.ActivityLog;
import com.niyati.template.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@Service
public class ActivityLogService {
    @Autowired private ActivityLogRepository repository;

    public List<ActivityLog> findAll() { return repository.findAll(); }
    public ActivityLog findById(Long id) { return repository.findById(id).orElse(null); }
    public ActivityLog save(ActivityLog entity) { return repository.save(entity); }
    public void deleteById(Long id) { repository.deleteById(id); }
}