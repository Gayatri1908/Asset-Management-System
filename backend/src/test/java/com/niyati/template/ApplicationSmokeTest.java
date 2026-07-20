package com.niyati.template;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ApplicationSmokeTest {
    @Test
    void healthEndpointReturnsOk() throws IOException {
        HttpServer server = Application.createServer(0);
        server.start();
        try {
            int port = server.getAddress().getPort();
            HttpURLConnection conn = (HttpURLConnection) new URL("http://127.0.0.1:" + port + "/health").openConnection();
            assertEquals(200, conn.getResponseCode());
        } finally {
            server.stop(0);
        }
    }
}
