package com.niyati.template.service;
import com.niyati.template.entity.Vendor;
import com.niyati.template.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@Service
public class VendorService {
    @Autowired private VendorRepository repository;

    public List<Vendor> findAll() { return repository.findAll(); }
    public Vendor findById(Long id) { return repository.findById(id).orElse(null); }
    public Vendor save(Vendor entity) { return repository.save(entity); }
    public void deleteById(Long id) { repository.deleteById(id); }
}