package com.dbmodeling.presentation.controller;

import com.dbmodeling.infrastructure.config.CacheConfig;
import com.dbmodeling.infrastructure.config.PerformanceMonitoringConfig;
import com.dbmodeling.presentation.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.cache.CacheManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentMap;

/**
 * 성능 모니터링 컨트롤러
 * 개발 및 운영 환경에서 성능 메트릭을 조회할 수 있는 API 제공
 */
@RestController
@RequestMapping("/api/performance")
@Tag(name = "Performance", description = "성능 모니터링 API")
public class PerformanceController implements HealthIndicator {

    private final PerformanceMonitoringConfig performanceMonitor;
    private final CacheConfig.CacheStatsManager cacheStatsManager;
    private final CacheManager cacheManager;

    public PerformanceController(
            PerformanceMonitoringConfig performanceMonitor,
            CacheConfig.CacheStatsManager cacheStatsManager,
            CacheManager cacheManager) {
        this.performanceMonitor = performanceMonitor;
        this.cacheStatsManager = cacheStatsManager;
        this.cacheManager = cacheManager;
    }

    /**
     * 전체 성능 메트릭 조회
     */
    @GetMapping("/metrics")
    @Operation(summary = "전체 성능 메트릭 조회", description = "API 호출 성능 메트릭을 조회합니다.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPerformanceMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        // API 성능 메트릭
        ConcurrentMap<String, PerformanceMonitoringConfig.ApiMetrics> apiMetrics = 
            performanceMonitor.getAllMetrics();
        
        Map<String, Object> apiStats = new HashMap<>();
        apiMetrics.forEach((method, metric) -> {
            Map<String, Object> methodStats = new HashMap<>();
            methodStats.put("totalCalls", metric.getTotalCalls());
            methodStats.put("successCalls", metric.getSuccessCalls());
            methodStats.put("failureCalls", metric.getFailureCalls());
            methodStats.put("successRate", metric.getSuccessRate());
            methodStats.put("averageTime", metric.getAverageTime());
            methodStats.put("minTime", metric.getMinTime());
            methodStats.put("maxTime", metric.getMaxTime());
            methodStats.put("lastCallTime", metric.getLastCallTime());
            apiStats.put(method, methodStats);
        });
        
        metrics.put("api", apiStats);
        
        // 캐시 성능 메트릭
        ConcurrentMap<String, CacheConfig.CacheStats> cacheStats = 
            cacheStatsManager.getAllStats();
        
        Map<String, Object> cacheMetrics = new HashMap<>();
        cacheStats.forEach((cacheName, stats) -> {
            Map<String, Object> cacheInfo = new HashMap<>();
            cacheInfo.put("hits", stats.getHits());
            cacheInfo.put("misses", stats.getMisses());
            cacheInfo.put("total", stats.getTotal());
            cacheInfo.put("hitRate", stats.getHitRate());
            cacheInfo.put("lastAccessTime", stats.getLastAccessTime());
            cacheMetrics.put(cacheName, cacheInfo);
        });
        
        metrics.put("cache", cacheMetrics);
        
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }

    /**
     * 특정 API 메트릭 조회
     */
    @GetMapping("/metrics/api/{methodName}")
    @Operation(summary = "특정 API 메트릭 조회", description = "특정 API 메서드의 성능 메트릭을 조회합니다.")
    public ResponseEntity<ApiResponse<PerformanceMonitoringConfig.ApiMetrics>> getApiMetrics(
            @PathVariable String methodName) {
        PerformanceMonitoringConfig.ApiMetrics metrics = performanceMonitor.getMetrics(methodName);
        
        if (metrics == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }

    /**
     * 캐시 통계 조회
     */
    @GetMapping("/cache/stats")
    @Operation(summary = "캐시 통계 조회", description = "모든 캐시의 통계 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<Map<String, CacheConfig.CacheStats>>> getCacheStats() {
        ConcurrentMap<String, CacheConfig.CacheStats> stats = cacheStatsManager.getAllStats();
        return ResponseEntity.ok(ApiResponse.success(new HashMap<>(stats)));
    }

    /**
     * 특정 캐시 통계 조회
     */
    @GetMapping("/cache/stats/{cacheName}")
    @Operation(summary = "특정 캐시 통계 조회", description = "특정 캐시의 통계 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<CacheConfig.CacheStats>> getCacheStats(
            @PathVariable String cacheName) {
        CacheConfig.CacheStats stats = cacheStatsManager.getStats(cacheName);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    /**
     * 캐시 초기화
     */
    @DeleteMapping("/cache/{cacheName}")
    @Operation(summary = "캐시 초기화", description = "특정 캐시를 초기화합니다.")
    public ResponseEntity<ApiResponse<Void>> clearCache(@PathVariable String cacheName) {
        if (cacheManager.getCache(cacheName) != null) {
            cacheManager.getCache(cacheName).clear();
            return ResponseEntity.ok(ApiResponse.success(null));
        }
        
        return ResponseEntity.notFound().build();
    }

    /**
     * 모든 캐시 초기화
     */
    @DeleteMapping("/cache")
    @Operation(summary = "모든 캐시 초기화", description = "모든 캐시를 초기화합니다.")
    public ResponseEntity<ApiResponse<Void>> clearAllCaches() {
        cacheManager.getCacheNames().forEach(cacheName -> {
            if (cacheManager.getCache(cacheName) != null) {
                cacheManager.getCache(cacheName).clear();
            }
        });
        
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 성능 메트릭 초기화
     */
    @DeleteMapping("/metrics")
    @Operation(summary = "성능 메트릭 초기화", description = "모든 성능 메트릭을 초기화합니다.")
    public ResponseEntity<ApiResponse<Void>> clearMetrics() {
        performanceMonitor.clearMetrics();
        cacheStatsManager.clearStats();
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 시스템 상태 확인 (Health Check)
     */
    @Override
    public Health health() {
        try {
            // 기본적인 시스템 상태 확인
            ConcurrentMap<String, PerformanceMonitoringConfig.ApiMetrics> metrics = 
                performanceMonitor.getAllMetrics();
            
            // 평균 응답 시간이 1초를 초과하는 API가 있는지 확인
            boolean hasSlowApis = metrics.values().stream()
                .anyMatch(metric -> metric.getAverageTime() > 1000);
            
            // 성공률이 95% 미만인 API가 있는지 확인
            boolean hasUnreliableApis = metrics.values().stream()
                .anyMatch(metric -> metric.getSuccessRate() < 0.95 && metric.getTotalCalls() > 10);
            
            Health.Builder builder = Health.up()
                .withDetail("totalApis", metrics.size())
                .withDetail("hasSlowApis", hasSlowApis)
                .withDetail("hasUnreliableApis", hasUnreliableApis);
            
            if (hasSlowApis || hasUnreliableApis) {
                builder.status("WARNING");
            }
            
            return builder.build();
            
        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}