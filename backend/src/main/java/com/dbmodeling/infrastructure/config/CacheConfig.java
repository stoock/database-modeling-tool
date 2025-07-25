package com.dbmodeling.infrastructure.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * 캐싱 설정
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String PROJECT_CACHE = "projects";
    public static final String TABLE_CACHE = "tables";
    public static final String VALIDATION_CACHE = "validation";
    public static final String SCHEMA_CACHE = "schema";

    /**
     * 기본 캐시 매니저 설정
     */
    @Bean
    @Primary
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager(
            PROJECT_CACHE,
            TABLE_CACHE,
            VALIDATION_CACHE,
            SCHEMA_CACHE
        );
        
        // 캐시 설정 커스터마이징
        cacheManager.setAllowNullValues(false);
        
        return cacheManager;
    }

    /**
     * 캐시 통계를 위한 커스텀 캐시 매니저
     */
    @Bean
    public CacheStatsManager cacheStatsManager() {
        return new CacheStatsManager();
    }

    /**
     * 캐시 통계 관리 클래스
     */
    public static class CacheStatsManager {
        private final ConcurrentMap<String, CacheStats> stats = new ConcurrentHashMap<>();

        public void recordHit(String cacheName) {
            stats.computeIfAbsent(cacheName, k -> new CacheStats()).incrementHit();
        }

        public void recordMiss(String cacheName) {
            stats.computeIfAbsent(cacheName, k -> new CacheStats()).incrementMiss();
        }

        public CacheStats getStats(String cacheName) {
            return stats.getOrDefault(cacheName, new CacheStats());
        }

        public ConcurrentMap<String, CacheStats> getAllStats() {
            return new ConcurrentHashMap<>(stats);
        }

        public void clearStats() {
            stats.clear();
        }
    }

    /**
     * 캐시 통계 정보
     */
    public static class CacheStats {
        private long hits = 0;
        private long misses = 0;
        private long lastAccessTime = System.currentTimeMillis();

        public synchronized void incrementHit() {
            hits++;
            lastAccessTime = System.currentTimeMillis();
        }

        public synchronized void incrementMiss() {
            misses++;
            lastAccessTime = System.currentTimeMillis();
        }

        public long getHits() { return hits; }
        public long getMisses() { return misses; }
        public long getTotal() { return hits + misses; }
        public double getHitRate() { 
            long total = getTotal();
            return total == 0 ? 0.0 : (double) hits / total; 
        }
        public long getLastAccessTime() { return lastAccessTime; }
    }
}