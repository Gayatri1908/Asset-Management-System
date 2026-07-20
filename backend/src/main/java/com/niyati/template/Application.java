package com.niyati.template;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public class Application {
    public static HttpServer createServer(int port) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/health", jsonHandler("{\"ok\":true,\"service\":\"api\",\"stack\":\"java\"}"));
        server.createContext("/api/version", jsonHandler("{\"version\":\"starter-v1\",\"runtime\":\"java\",\"deploy_target\":\"render\"}"));
        server.createContext("/api/ping", jsonHandler("{\"ok\":true,\"message\":\"pong\"}"));
        server.createContext("/", exchange -> {
            byte[] body = "{\"ok\":false,\"error\":\"NOT_FOUND\"}".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(404, body.length);
            try (OutputStream out = exchange.getResponseBody()) {
                out.write(body);
            }
        });
        return server;
    }

    private static HttpHandler jsonHandler(String body) {
        return exchange -> {
            byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream out = exchange.getResponseBody()) {
                out.write(bytes);
            }
        };
    }

    public static void main(String[] args) throws IOException {
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        HttpServer server = createServer(port);
        server.start();
        System.out.println("Niyati Java starter backend listening on " + port);
    }
}
