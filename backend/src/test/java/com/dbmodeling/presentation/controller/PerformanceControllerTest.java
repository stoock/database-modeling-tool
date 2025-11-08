package com.dbmodeling.presentation.controller;

import com.dbmodeling.infrastructure.config.CacheConfig;
import com.dbmodeling.infrastructure.config.PerformanceMonitoringConfig;
import com.dbmodeling.presentation.dto.response.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.Status;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("성능 모니터링 컨트롤러 테스트")
class PerformanceControllerTest {

    @Mock
    private PerformanceMonitoringConfig performanceMonitor;

    @Mock
    private CacheConfig.CacheStatsManager cacheStatsManager;

    @Mock
    private CacheManager cacheManager;

    @Mock
    private Cache cache;

    @InjectMocks
    private PerformanceController performanceController;

    private ConcurrentMap<String, PerformanceMonitoringConfig.ApiMetrics> apiMetrics;
    private ConcurrentMap<String, CacheConfig.CacheStats> cacheStats;

    @BeforeEach
    void setUp() {
        apiMetrics = new ConcurrentHashMap<>();
        cacheStats = new ConcurrentHashMap<>();
    }

    @Test
    @DisplayName("전체 성능 메트릭 조회 - 성공")
    void getPerformanceMetrics_Success() {
        // Given
        PerformanceMonitoringConfig.ApiMetrics metrics = new PerformanceMonitoringConfig.ApiMetrics();
        metrics.record(100, true);
        metrics.record(200, true);
        apiMetrics.put("testMethod", metrics);

        CacheConfig.CacheStats stats = new CacheConfig.CacheStats();
        stats.incrementHit();
        stats.incrementMiss();
        cacheStats.put("testCache", stats);

        when(performanceMonitor.getAllMetrics()).thenReturn(apiMetrics);
        when(cacheStatsManager.getAllStats()).thenReturn(cacheStats);

        // When
        ResponseEntity<ApiResponse<Map<String, Object>>> response =
            performanceController.getPerformanceMetrics();

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).isNotNull();

        Map<String, Object> data = response.getBody().getData();
        assertThat(data).containsKeys("api", "cache");

        verify(performanceMonitor).getAllMetrics();
        verify(cacheStatsManager).getAllStats();
    }

    @Test
    @DisplayName("특정 API 메트릭 조회 - 성공")
    void getApiMetrics_Success() {
        // Given
        String methodName = "testMethod";
        PerformanceMonitoringConfig.ApiMetrics metrics = new PerformanceMonitoringConfig.ApiMetrics();
        metrics.record(100, true);

        when(performanceMonitor.getMetrics(methodName)).thenReturn(metrics);

        // When
        ResponseEntity<ApiResponse<PerformanceMonitoringConfig.ApiMetrics>> response =
            performanceController.getApiMetrics(methodName);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getTotalCalls()).isEqualTo(1);

        verify(performanceMonitor).getMetrics(methodName);
    }

    @Test
    @DisplayName("특정 API 메트릭 조회 - 존재하지 않는 메서드")
    void getApiMetrics_NotFound() {
        // Given
        String methodName = "nonExistentMethod";
        when(performanceMonitor.getMetrics(methodName)).thenReturn(null);

        // When
        ResponseEntity<ApiResponse<PerformanceMonitoringConfig.ApiMetrics>> response =
            performanceController.getApiMetrics(methodName);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);

        verify(performanceMonitor).getMetrics(methodName);
    }

    @Test
    @DisplayName("캐시 통계 조회 - 성공")
    void getCacheStats_Success() {
        // Given
        CacheConfig.CacheStats stats = new CacheConfig.CacheStats();
        stats.incrementHit();
        cacheStats.put("testCache", stats);

        when(cacheStatsManager.getAllStats()).thenReturn(cacheStats);

        // When
        ResponseEntity<ApiResponse<Map<String, CacheConfig.CacheStats>>> response =
            performanceController.getCacheStats();

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData()).containsKey("testCache");

        verify(cacheStatsManager).getAllStats();
    }

    @Test
    @DisplayName("특정 캐시 통계 조회 - 성공")
    void getCacheStatsByCacheName_Success() {
        // Given
        String cacheName = "testCache";
        CacheConfig.CacheStats stats = new CacheConfig.CacheStats();
        stats.incrementHit();
        stats.incrementHit();
        stats.incrementMiss();

        when(cacheStatsManager.getStats(cacheName)).thenReturn(stats);

        // When
        ResponseEntity<ApiResponse<CacheConfig.CacheStats>> response =
            performanceController.getCacheStats(cacheName);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getHits()).isEqualTo(2);
        assertThat(response.getBody().getData().getMisses()).isEqualTo(1);

        verify(cacheStatsManager).getStats(cacheName);
    }

    @Test
    @DisplayName("캐시 초기화 - 성공")
    void clearCache_Success() {
        // Given
        String cacheName = "testCache";
        when(cacheManager.getCache(cacheName)).thenReturn(cache);
        doNothing().when(cache).clear();

        // When
        ResponseEntity<ApiResponse<Void>> response =
            performanceController.clearCache(cacheName);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        verify(cacheManager).getCache(cacheName);
        verify(cache).clear();
    }

    @Test
    @DisplayName("캐시 초기화 - 존재하지 않는 캐시")
    void clearCache_NotFound() {
        // Given
        String cacheName = "nonExistentCache";
        when(cacheManager.getCache(cacheName)).thenReturn(null);

        // When
        ResponseEntity<ApiResponse<Void>> response =
            performanceController.clearCache(cacheName);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);

        verify(cacheManager).getCache(cacheName);
        verify(cache, never()).clear();
    }

    @Test
    @DisplayName("모든 캐시 초기화 - 성공")
    void clearAllCaches_Success() {
        // Given
        when(cacheManager.getCacheNames()).thenReturn(Arrays.asList("cache1", "cache2"));
        when(cacheManager.getCache("cache1")).thenReturn(cache);
        when(cacheManager.getCache("cache2")).thenReturn(cache);
        doNothing().when(cache).clear();

        // When
        ResponseEntity<ApiResponse<Void>> response =
            performanceController.clearAllCaches();

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        verify(cacheManager).getCacheNames();
        verify(cache, times(2)).clear();
    }

    @Test
    @DisplayName("성능 메트릭 초기화 - 성공")
    void clearMetrics_Success() {
        // Given
        doNothing().when(performanceMonitor).clearMetrics();
        doNothing().when(cacheStatsManager).clearStats();

        // When
        ResponseEntity<ApiResponse<Void>> response =
            performanceController.clearMetrics();

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        verify(performanceMonitor).clearMetrics();
        verify(cacheStatsManager).clearStats();
    }

    @Test
    @DisplayName("시스템 상태 확인 - 정상")
    void health_Up() {
        // Given
        PerformanceMonitoringConfig.ApiMetrics metrics1 = new PerformanceMonitoringConfig.ApiMetrics();
        metrics1.record(100, true);
        metrics1.record(150, true);

        apiMetrics.put("method1", metrics1);
        when(performanceMonitor.getAllMetrics()).thenReturn(apiMetrics);

        // When
        Health health = performanceController.health();

        // Then
        assertThat(health.getStatus()).isEqualTo(Status.UP);
        assertThat(health.getDetails()).containsKeys("totalApis", "hasSlowApis", "hasUnreliableApis");
        assertThat(health.getDetails().get("totalApis")).isEqualTo(1);
        assertThat(health.getDetails().get("hasSlowApis")).isEqualTo(false);
        assertThat(health.getDetails().get("hasUnreliableApis")).isEqualTo(false);
    }

    @Test
    @DisplayName("시스템 상태 확인 - 느린 API 감지")
    void health_Warning_SlowApi() {
        // Given
        PerformanceMonitoringConfig.ApiMetrics slowMetrics = new PerformanceMonitoringConfig.ApiMetrics();
        slowMetrics.record(2000, true); // 2초 (느린 API)

        apiMetrics.put("slowMethod", slowMetrics);
        when(performanceMonitor.getAllMetrics()).thenReturn(apiMetrics);

        // When
        Health health = performanceController.health();

        // Then
        assertThat(health.getStatus()).isEqualTo(new Status("WARNING"));
        assertThat(health.getDetails().get("hasSlowApis")).isEqualTo(true);
    }

    @Test
    @DisplayName("시스템 상태 확인 - 낮은 성공률 API 감지")
    void health_Warning_UnreliableApi() {
        // Given
        PerformanceMonitoringConfig.ApiMetrics unreliableMetrics = new PerformanceMonitoringConfig.ApiMetrics();
        // 15번 호출 중 10번 성공 (66.7% 성공률 - 95% 미만)
        for (int i = 0; i < 10; i++) {
            unreliableMetrics.record(100, true);
        }
        for (int i = 0; i < 5; i++) {
            unreliableMetrics.record(100, false);
        }

        apiMetrics.put("unreliableMethod", unreliableMetrics);
        when(performanceMonitor.getAllMetrics()).thenReturn(apiMetrics);

        // When
        Health health = performanceController.health();

        // Then
        assertThat(health.getStatus()).isEqualTo(new Status("WARNING"));
        assertThat(health.getDetails().get("hasUnreliableApis")).isEqualTo(true);
    }

    @Test
    @DisplayName("시스템 상태 확인 - 예외 발생")
    void health_Down_Exception() {
        // Given
        when(performanceMonitor.getAllMetrics()).thenThrow(new RuntimeException("Test exception"));

        // When
        Health health = performanceController.health();

        // Then
        assertThat(health.getStatus()).isEqualTo(Status.DOWN);
        assertThat(health.getDetails()).containsKey("error");
    }
}
