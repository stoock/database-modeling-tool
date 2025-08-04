package com.dbmodeling.presentation.controller;

import com.dbmodeling.presentation.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 헬스 체크 컨트롤러
 * API 서버의 상태를 확인하는 엔드포인트를 제공합니다.
 */
@RestController
@RequestMapping(ApiConstants.API_BASE_PATH)
@Tag(name = "헬스 체크", description = "API 서버 상태 확인")
public class HealthController extends BaseController {

    @Operation(
        summary = "헬스 체크",
        description = "API 서버가 정상적으로 작동하는지 확인합니다."
    )
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> healthInfo = Map.of(
            "status", "UP",
            "timestamp", LocalDateTime.now(),
            "service", "Database Modeling Tool API",
            "version", "1.0.0"
        );
        
        return ResponseEntity.ok(healthInfo);
    }
}