package com.niyati.template.service;

import com.niyati.template.dto.request.EmployeeDto;
import com.niyati.template.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmployeeService {
    Page<Employee> getAllEmployees(Pageable pageable);
    Employee getEmployeeById(Long id);
    Employee createEmployee(EmployeeDto employeeDto);
    Employee updateEmployee(Long id, EmployeeDto employeeDto);
    void deleteEmployee(Long id);
}
