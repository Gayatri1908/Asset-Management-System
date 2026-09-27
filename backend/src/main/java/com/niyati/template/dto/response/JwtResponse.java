package com.niyati.template.dto.response;

public class JwtResponse {
    private boolean success = true;
    private String token;
    private UserAuthDto user;

    public JwtResponse() {}

    public JwtResponse(String token, Long id, String name, String email, String role) {
        this.token = token;
        this.user = new UserAuthDto(id, name, email, role);
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public UserAuthDto getUser() { return user; }
    public void setUser(UserAuthDto user) { this.user = user; }

    public static class UserAuthDto {
        private Long id;
        private String name;
        private String email;
        private String role;

        public UserAuthDto() {}

        public UserAuthDto(Long id, String name, String email, String role) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}
