package com.dbmodeling.presentation.controller;

import com.dbmodeling.presentation.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 헬스 체크 컨트롤러
 * API 서버의 상태를 확인하는 엔드포인트를 제공합니다.
 */
@RestController
@RequestMapping(ApiConstants.API_BASE_PATH)
@Tag(name = "헬스 체크", description = "API 서버 상태 확인")
public class HealthController extends BaseController {

    @Autowired
    private DataSource dataSource;

    @Operation(
        summary = "헬스 체크",
        description = "API 서버가 정상적으로 작동하는지 확인합니다."
    )
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> healthInfo = new HashMap<>();
        healthInfo.put("timestamp", LocalDateTime.now());
        healthInfo.put("service", "Database Modeling Tool API");
        healthInfo.put("version", "1.0.0");
        
        // 데이터베이스 연결 상태 확인
        boolean dbConnected = checkDatabaseConnection();
        healthInfo.put("database", dbConnected ? "UP" : "DOWN");
        
        if (dbConnected) {
            healthInfo.put("status", "UP");
            return ResponseEntity.ok(healthInfo);
        } else {
            healthInfo.put("status", "DEGRADED");
            healthInfo.put("message", "PostgreSQL 데이터베이스에 연결할 수 없습니다. Docker 컨테이너가 실행 중인지 확인하세요.");
            healthInfo.put("hint", "실행 명령: docker-compose up -d 또는 .\\scripts\\01-env-setup.ps1");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(healthInfo);
        }
    }
    
    /**
     * 데이터베이스 연결 상태를 확인합니다.
     */
    private boolean checkDatabaseConnection() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(3);
        } catch (Exception e) {
            logger.warn("데이터베이스 연결 실패: {}", e.getMessage());
            return false;
        }
    }
}