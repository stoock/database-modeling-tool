package com.dbmodeling.infrastructure.config;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StopWatch;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * API 성능 모니터링 설정
 */
@Aspect
@Configuration
public class PerformanceMonitoringConfig {

    private static final Logger logger = LoggerFactory.getLogger(PerformanceMonitoringConfig.class);
    private static final long SLOW_QUERY_THRESHOLD_MS = 500; // 500ms 이상이면 느린 쿼리로 간주

    private final ConcurrentMap<String, ApiMetrics> metricsMap = new ConcurrentHashMap<>();

    /**
     * 컨트롤러 메서드 실행 시간 모니터링
     */
    @Around("execution(* com.dbmodeling.presentation.controller.*.*(..))")
    public Object monitorControllerPerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        StopWatch stopWatch = new StopWatch();
        
        stopWatch.start();
        try {
            Object result = joinPoint.proceed();
            stopWatch.stop();
            
            long executionTime = stopWatch.getTotalTimeMillis();
            recordMetrics(methodName, executionTime, true);
            
            if (executionTime > SLOW_QUERY_THRESHOLD_MS) {
                logger.warn("느린 API 호출 감지: {} - {}ms", methodName, executionTime);
            } else {
                logger.debug("API 호출 완료: {} - {}ms", methodName, executionTime);
            }
            
            return result;
        } catch (Exception e) {
            stopWatch.stop();
            recordMetrics(methodName, stopWatch.getTotalTimeMillis(), false);
            throw e;
        }
    }

    /**
     * 서비스 메서드 실행 시간 모니터링
     */
    @Around("execution(* com.dbmodeling.application.service.*.*(..))")
    public Object monitorServicePerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        StopWatch stopWatch = new StopWatch();
        
        stopWatch.start();
        try {
            Object result = joinPoint.proceed();
            stopWatch.stop();
            
            long executionTime = stopWatch.getTotalTimeMillis();
            recordMetrics("Service." + methodName, executionTime, true);
            
            if (executionTime > SLOW_QUERY_THRESHOLD_MS) {
                logger.warn("느린 서비스 호출 감지: {} - {}ms", methodName, executionTime);
            }
            
            return result;
        } catch (Exception e) {
            stopWatch.stop();
            recordMetrics("Service." + methodName, stopWatch.getTotalTimeMillis(), false);
            throw e;
        }
    }

    /**
     * 리포지토리 메서드 실행 시간 모니터링
     */
    @Around("execution(* com.dbmodeling.infrastructure.persistence.repository.*.*(..))")
    public Object monitorRepositoryPerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        StopWatch stopWatch = new StopWatch();
        
        stopWatch.start();
        try {
            Object result = joinPoint.proceed();
            stopWatch.stop();
            
            long executionTime = stopWatch.getTotalTimeMillis();
            recordMetrics("Repository." + methodName, executionTime, true);
            
            if (executionTime > SLOW_QUERY_THRESHOLD_MS) {
                logger.warn("느린 데이터베이스 쿼리 감지: {} - {}ms", methodName, executionTime);
            }
            
            return result;
        } catch (Exception e) {
            stopWatch.stop();
            recordMetrics("Repository." + methodName, stopWatch.getTotalTimeMillis(), false);
            throw e;
        }
    }

    /**
     * 메트릭 기록
     */
    private void recordMetrics(String methodName, long executionTime, boolean success) {
        ApiMetrics metrics = metricsMap.computeIfAbsent(methodName, k -> new ApiMetrics());
        metrics.record(executionTime, success);
    }

    /**
     * 모든 메트릭 조회
     */
    public ConcurrentMap<String, ApiMetrics> getAllMetrics() {
        return new ConcurrentHashMap<>(metricsMap);
    }

    /**
     * 특정 메서드 메트릭 조회
     */
    public ApiMetrics getMetrics(String methodName) {
        return metricsMap.get(methodName);
    }

    /**
     * 메트릭 초기화
     */
    public void clearMetrics() {
        metricsMap.clear();
    }

    /**
     * API 메트릭 정보
     */
    public static class ApiMetrics {
        private final AtomicLong totalCalls = new AtomicLong(0);
        private final AtomicLong successCalls = new AtomicLong(0);
        private final AtomicLong totalTime = new AtomicLong(0);
        private volatile long minTime = Long.MAX_VALUE;
        private volatile long maxTime = 0;
        private volatile long lastCallTime = System.currentTimeMillis();

        public synchronized void record(long executionTime, boolean success) {
            totalCalls.incrementAndGet();
            if (success) {
                successCalls.incrementAndGet();
            }
            
            totalTime.addAndGet(executionTime);
            
            if (executionTime < minTime) {
                minTime = executionTime;
            }
            if (executionTime > maxTime) {
                maxTime = executionTime;
            }
            
            lastCallTime = System.currentTimeMillis();
        }

        public long getTotalCalls() { return totalCalls.get(); }
        public long getSuccessCalls() { return successCalls.get(); }
        public long getFailureCalls() { return totalCalls.get() - successCalls.get(); }
        public double getSuccessRate() { 
            long total = totalCalls.get();
            return total == 0 ? 0.0 : (double) successCalls.get() / total; 
        }
        public double getAverageTime() { 
            long total = totalCalls.get();
            return total == 0 ? 0.0 : (double) totalTime.get() / total; 
        }
        public long getMinTime() { return minTime == Long.MAX_VALUE ? 0 : minTime; }
        public long getMaxTime() { return maxTime; }
        public long getLastCallTime() { return lastCallTime; }
    }
}