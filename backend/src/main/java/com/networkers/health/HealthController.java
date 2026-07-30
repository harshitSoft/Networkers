package com.networkers.health;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HealthController {
    private final JdbcTemplate jdbc;

    public HealthController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping({"/health", "/api/health"})
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("service", "networkers-backend");
        result.put("timestamp", Instant.now().toString());

        try {
            Integer databaseCheck = jdbc.queryForObject("select 1", Integer.class);
            boolean databaseUp = Integer.valueOf(1).equals(databaseCheck);
            result.put("status", databaseUp ? "UP" : "DOWN");
            result.put("database", databaseUp ? "UP" : "DOWN");
            return ResponseEntity.status(databaseUp ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).body(result);
        } catch (Exception exception) {
            result.put("status", "DOWN");
            result.put("database", "DOWN");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(result);
        }
    }
}
