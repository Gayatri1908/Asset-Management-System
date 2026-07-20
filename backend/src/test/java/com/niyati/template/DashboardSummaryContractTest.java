package com.niyati.template;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.HttpURLConnection;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DashboardSummaryContractTest {
    @Test
    void dashboardSummaryContract() throws IOException {
        HttpServer server = HttpTestSupport.startServer();
        try {
            HttpURLConnection conn = HttpTestSupport.connection(server, "/api/version");
            assertEquals(200, conn.getResponseCode());
            assertTrue(HttpTestSupport.readBody(conn).contains("\"deploy_target\":\"render\""));
        } finally {
            server.stop(0);
        }
    }
}
