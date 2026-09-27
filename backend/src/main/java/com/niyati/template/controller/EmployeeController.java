package com.niyati.template.controller;

import com.niyati.template.dto.request.EmployeeDto;
import com.niyati.template.dto.response.ApiResponse;
import com.niyati.template.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<?> getAllEmployees(Pageable pageable) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Employees retrieved", employeeService.getAllEmployees(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Employee retrieved", employeeService.getEmployeeById(id)));
    }

    @PostMapping
    public ResponseEntity<?> createEmployee(@Valid @RequestBody EmployeeDto employeeDto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Employee created successfully", employeeService.createEmployee(employeeDto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeDto employeeDto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Employee updated successfully", employeeService.updateEmployee(id, employeeDto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Employee deleted successfully", null));
    }
}
