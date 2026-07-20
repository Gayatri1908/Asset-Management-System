package com.niyati.template;

import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

final class HttpTestSupport {
    private HttpTestSupport() {}

    static HttpServer startServer() throws IOException {
        HttpServer server = Application.createServer(0);
        server.start();
        return server;
    }

    static HttpURLConnection connection(HttpServer server, String path) throws IOException {
        int port = server.getAddress().getPort();
        return (HttpURLConnection) new URL("http://127.0.0.1:" + port + path).openConnection();
    }

    static String readBody(HttpURLConnection connection) throws IOException {
        InputStream stream = connection.getResponseCode() >= 400 ? connection.getErrorStream() : connection.getInputStream();
        try (InputStream body = stream) {
            if (body == null) return "";
            return new String(body.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
