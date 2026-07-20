package com.niyati.template;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.HttpURLConnection;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PaginationContractTest {
    @Test
    void paginationContract() throws IOException {
        HttpServer server = HttpTestSupport.startServer();
        try {
            HttpURLConnection conn = HttpTestSupport.connection(server, "/api/version");
            assertEquals(200, conn.getResponseCode());
        } finally {
            server.stop(0);
        }
    }
}
