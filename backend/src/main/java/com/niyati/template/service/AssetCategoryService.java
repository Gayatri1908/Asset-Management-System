package com.niyati.template.service;
import com.niyati.template.entity.AssetCategory;
import com.niyati.template.repository.AssetCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@Service
public class AssetCategoryService {
    @Autowired private AssetCategoryRepository repository;

    public List<AssetCategory> findAll() { return repository.findAll(); }
    public AssetCategory findById(Long id) { return repository.findById(id).orElse(null); }
    public AssetCategory save(AssetCategory entity) { return repository.save(entity); }
    public void deleteById(Long id) { repository.deleteById(id); }
}