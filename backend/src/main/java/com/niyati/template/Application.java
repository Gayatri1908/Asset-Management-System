package com.niyati.template;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.niyati.template.entity.User;
import com.niyati.template.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.niyati.template.entity.Asset;
import com.niyati.template.entity.Employee;
import com.niyati.template.repository.AssetRepository;
import com.niyati.template.repository.EmployeeRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    public static com.sun.net.httpserver.HttpServer createServer(int port) throws java.io.IOException {
        com.sun.net.httpserver.HttpServer server = com.sun.net.httpserver.HttpServer.create(new java.net.InetSocketAddress(port), 0);
        server.createContext("/health", exchange -> {
            byte[] body = "{\"ok\":true,\"service\":\"api\",\"stack\":\"java\"}".getBytes(java.nio.charset.StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, body.length);
            try (java.io.OutputStream out = exchange.getResponseBody()) { out.write(body); }
        });
        server.createContext("/api/version", exchange -> {
            byte[] body = "{\"version\":\"starter-v1\",\"runtime\":\"java\",\"deploy_target\":\"render\"}".getBytes(java.nio.charset.StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, body.length);
            try (java.io.OutputStream out = exchange.getResponseBody()) { out.write(body); }
        });
        server.createContext("/api/ping", exchange -> {
            byte[] body = "{\"ok\":true,\"message\":\"pong\"}".getBytes(java.nio.charset.StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, body.length);
            try (java.io.OutputStream out = exchange.getResponseBody()) { out.write(body); }
        });
        server.createContext("/", exchange -> {
            byte[] body = "{\"ok\":false,\"error\":\"NOT_FOUND\"}".getBytes(java.nio.charset.StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(404, body.length);
            try (java.io.OutputStream out = exchange.getResponseBody()) { out.write(body); }
        });
        return server;
    }

    @Bean
    public CommandLineRunner initData(
            UserRepository userRepository,
            EmployeeRepository employeeRepository,
            AssetRepository assetRepository,
            com.niyati.template.repository.DepartmentRepository departmentRepository,
            com.niyati.template.repository.AssetCategoryRepository categoryRepository,
            com.niyati.template.repository.VendorRepository vendorRepository,
            com.niyati.template.repository.AssetIssueRepository assetIssueRepository,
            com.niyati.template.repository.AssetRequestRepository assetRequestRepository,
            com.niyati.template.repository.MaintenanceRepository maintenanceRepository,
            com.niyati.template.repository.NotificationRepository notificationRepository,
            com.niyati.template.repository.ActivityLogRepository activityLogRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            String encodedPassword = passwordEncoder.encode("Admin@123");

            // 1. Users & Employees
            User admin = userRepository.findByUsername("admin").orElse(null);
            if (admin == null) {
                admin = new User();
                admin.setUsername("admin");
                admin.setName("Rajesh Kumar Sharma");
                admin.setEmail("admin@aims.in");
                admin.setPhone("+91 98765 43210");
                admin.setPassword(encodedPassword);
                admin.setRole("ROLE_ADMIN");
                admin.setIsActive(true);
                admin = userRepository.save(admin);
            }

            User issuer = userRepository.findByUsername("issuer").orElse(null);
            if (issuer == null) {
                issuer = new User();
                issuer.setUsername("issuer");
                issuer.setName("Priya Patel");
                issuer.setEmail("issuer@aims.in");
                issuer.setPhone("+91 98201 23456");
                issuer.setPassword(encodedPassword);
                issuer.setRole("ROLE_ASSET_ISSUER");
                issuer.setIsActive(true);
                issuer = userRepository.save(issuer);
            }

            User employeeUser1 = userRepository.findByUsername("employee1").orElse(null);
            if (employeeUser1 == null) {
                employeeUser1 = new User();
                employeeUser1.setUsername("employee1");
                employeeUser1.setName("Rahul Verma");
                employeeUser1.setEmail("rahul.verma@aims.in");
                employeeUser1.setPhone("+91 97110 56789");
                employeeUser1.setPassword(encodedPassword);
                employeeUser1.setRole("ROLE_EMPLOYEE");
                employeeUser1.setIsActive(true);
                employeeUser1 = userRepository.save(employeeUser1);
            }

            Employee emp1 = employeeRepository.findByUserId(employeeUser1.getId());
            if (emp1 == null) {
                emp1 = new Employee();
                emp1.setUser(employeeUser1);
                emp1.setFirstName("Rahul");
                emp1.setLastName("Verma");
                emp1.setEmail("rahul.verma@aims.in");
                emp1.setPhone("+91 97110 56789");
                emp1.setDepartment("Engineering");
                emp1.setDesignation("Lead Software Engineer");
                emp1.setIsActive(true);
                emp1 = employeeRepository.save(emp1);
            }

            User employeeUser2 = userRepository.findByUsername("employee2").orElse(null);
            if (employeeUser2 == null) {
                employeeUser2 = new User();
                employeeUser2.setUsername("employee2");
                employeeUser2.setName("Sneha Iyer");
                employeeUser2.setEmail("sneha.iyer@aims.in");
                employeeUser2.setPhone("+91 99402 34567");
                employeeUser2.setPassword(encodedPassword);
                employeeUser2.setRole("ROLE_EMPLOYEE");
                employeeUser2.setIsActive(true);
                employeeUser2 = userRepository.save(employeeUser2);

                Employee emp2 = new Employee();
                emp2.setUser(employeeUser2);
                emp2.setFirstName("Sneha");
                emp2.setLastName("Iyer");
                emp2.setEmail("sneha.iyer@aims.in");
                emp2.setPhone("+91 99402 34567");
                emp2.setDepartment("Design");
                emp2.setDesignation("Senior UX Designer");
                emp2.setIsActive(true);
                employeeRepository.save(emp2);
            }

            // 2. Initial System Audit Activity Log
            if (activityLogRepository.count() == 0) {
                com.niyati.template.entity.ActivityLog log1 = new com.niyati.template.entity.ActivityLog();
                log1.setUser(admin);
                log1.setAction("SYSTEM_INIT");
                log1.setDetails("AIMS Enterprise Asset Management Desk initialized with persistent SQL database.");
                activityLogRepository.save(log1);
            }
        };
    }
}
