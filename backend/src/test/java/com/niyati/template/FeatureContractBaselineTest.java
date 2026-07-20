package com.niyati.template;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertTrue;

class FeatureContractBaselineTest {
    @Test
    void versionEndpointMentionsJavaRuntime() throws IOException {
        HttpServer server = Application.createServer(0);
        server.start();
        try {
            int port = server.getAddress().getPort();
            try (InputStream stream = new URL("http://127.0.0.1:" + port + "/api/version").openStream()) {
                String body = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
                assertTrue(body.contains("\"runtime\":\"java\""));
            }
        } finally {
            server.stop(0);
        }
    }
}
