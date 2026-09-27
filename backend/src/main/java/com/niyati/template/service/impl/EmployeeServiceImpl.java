package com.niyati.template.service.impl;

import com.niyati.template.dto.request.EmployeeDto;
import com.niyati.template.entity.Employee;
import com.niyati.template.exception.BadRequestException;
import com.niyati.template.exception.ResourceNotFoundException;
import com.niyati.template.repository.EmployeeRepository;
import com.niyati.template.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public Page<Employee> getAllEmployees(Pageable pageable) {
        return employeeRepository.findAll(pageable);
    }

    @Override
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
    }

    @Override
    public Employee createEmployee(EmployeeDto employeeDto) {
        if (employeeRepository.existsByEmail(employeeDto.getEmail())) {
            throw new BadRequestException("Email already exists: " + employeeDto.getEmail());
        }

        Employee employee = new Employee();
        mapDtoToEntity(employeeDto, employee);
        employee.setIsActive(true);
        return employeeRepository.save(employee);
    }

    @Override
    public Employee updateEmployee(Long id, EmployeeDto employeeDto) {
        Employee employee = getEmployeeById(id);
        
        if (!employee.getEmail().equals(employeeDto.getEmail()) && 
            employeeRepository.existsByEmail(employeeDto.getEmail())) {
            throw new BadRequestException("Email already exists: " + employeeDto.getEmail());
        }

        mapDtoToEntity(employeeDto, employee);
        return employeeRepository.save(employee);
    }

    @Override
    public void deleteEmployee(Long id) {
        Employee employee = getEmployeeById(id);
        employeeRepository.delete(employee);
    }

    private void mapDtoToEntity(EmployeeDto dto, Employee entity) {
        entity.setFirstName(dto.getFirstName());
        entity.setLastName(dto.getLastName());
        entity.setEmail(dto.getEmail());
        entity.setPhone(dto.getPhone());
        entity.setDepartment(dto.getDepartment());
        entity.setDesignation(dto.getDesignation());
        if (dto.getIsActive() != null) entity.setIsActive(dto.getIsActive());
    }
}
