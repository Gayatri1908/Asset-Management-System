package com.niyati.template.service;
import com.niyati.template.entity.PurchaseRecord;
import com.niyati.template.repository.PurchaseRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@Service
public class PurchaseRecordService {
    @Autowired private PurchaseRecordRepository repository;

    public List<PurchaseRecord> findAll() { return repository.findAll(); }
    public PurchaseRecord findById(Long id) { return repository.findById(id).orElse(null); }
    public PurchaseRecord save(PurchaseRecord entity) { return repository.save(entity); }
    public void deleteById(Long id) { repository.deleteById(id); }
}