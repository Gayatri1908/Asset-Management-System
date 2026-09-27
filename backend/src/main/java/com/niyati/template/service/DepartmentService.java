package com.niyati.template.service;
import com.niyati.template.entity.Department;
import com.niyati.template.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@Service
public class DepartmentService {
    @Autowired private DepartmentRepository repository;

    public List<Department> findAll() { return repository.findAll(); }
    public Department findById(Long id) { return repository.findById(id).orElse(null); }
    public Department save(Department entity) { return repository.save(entity); }
    public void deleteById(Long id) { repository.deleteById(id); }
}