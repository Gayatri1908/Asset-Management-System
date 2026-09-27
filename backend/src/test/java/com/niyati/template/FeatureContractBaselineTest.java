package com.niyati.template;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class FeatureContractBaselineTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void versionEndpointMentionsJavaRuntime() {
        ResponseEntity<String> response = restTemplate.getForEntity("http://localhost:" + port + "/api/version", String.class);
        assertNotNull(response.getBody());
        assertTrue(response.getBody().contains("\"runtime\":\"java\""));
    }
}
