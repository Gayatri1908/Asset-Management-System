package com.niyati.template.repository;
import com.niyati.template.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Employee findByUserId(Long userId);
    long countByIsActiveTrue();
    boolean existsByEmail(String email);
}