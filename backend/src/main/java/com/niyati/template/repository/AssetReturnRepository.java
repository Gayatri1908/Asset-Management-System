package com.niyati.template.repository;
import com.niyati.template.entity.AssetReturn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssetReturnRepository extends JpaRepository<AssetReturn, Long> {
    List<AssetReturn> findByStatus(String status);
}