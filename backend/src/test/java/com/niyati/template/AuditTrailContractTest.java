package com.niyati.template;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.HttpURLConnection;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AuditTrailContractTest {
    @Test
    void auditTrailContract() throws IOException {
        HttpServer server = HttpTestSupport.startServer();
        try {
            HttpURLConnection conn = HttpTestSupport.connection(server, "/health");
            assertEquals(200, conn.getResponseCode());
            assertTrue(HttpTestSupport.readBody(conn).contains("\"service\":\"api\""));
        } finally {
            server.stop(0);
        }
    }
}
