package com.dbmodeling.infrastructure.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;

/**
 * 데이터베이스 설정
 * 환경별 데이터소스 설정 및 JPA 설정을 관리
 */
@Configuration
@EnableJpaRepositories(basePackages = "com.dbmodeling.infrastructure.persistence.repository")
@EntityScan(basePackages = "com.dbmodeling.infrastructure.persistence.entity")
@EnableTransactionManagement
public class DatabaseConfig {
    
    /**
     * 개발 환경용 데이터소스 설정
     */
    @Bean
    @Primary
    @Profile("dev")
    @ConditionalOnProperty(name = "spring.datasource.url")
    public DataSource devDataSource(
            @Value("${spring.datasource.url}") String url,
            @Value("${spring.datasource.username}") String username,
            @Value("${spring.datasource.password}") String password,
            @Value("${spring.datasource.hikari.maximum-pool-size:10}") int maxPoolSize,
            @Value("${spring.datasource.hikari.minimum-idle:5}") int minIdle) {
        
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName("org.postgresql.Driver");
        
        // 개발 환경 최적화 설정
        config.setMaximumPoolSize(maxPoolSize);
        config.setMinimumIdle(minIdle);
        config.setIdleTimeout(300000); // 5분
        config.setConnectionTimeout(20000); // 20초
        config.setValidationTimeout(5000); // 5초
        config.setLeakDetectionThreshold(60000); // 1분
        
        // 연결 테스트 쿼리
        config.setConnectionTestQuery("SELECT 1");
        
        // 풀 이름 설정
        config.setPoolName("DBModeling-Dev-Pool");
        
        // 추가 설정
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
        config.addDataSourceProperty("useServerPrepStmts", "true");
        config.addDataSourceProperty("useLocalSessionState", "true");
        config.addDataSourceProperty("rewriteBatchedStatements", "true");
        config.addDataSourceProperty("cacheResultSetMetadata", "true");
        config.addDataSourceProperty("cacheServerConfiguration", "true");
        config.addDataSourceProperty("elideSetAutoCommits", "true");
        config.addDataSourceProperty("maintainTimeStats", "false");
        
        return new HikariDataSource(config);
    }
    
    /**
     * 테스트 환경용 데이터소스 설정
     */
    @Bean
    @Primary
    @Profile("test")
    @ConditionalOnProperty(name = "spring.datasource.url")
    public DataSource testDataSource(
            @Value("${spring.datasource.url}") String url,
            @Value("${spring.datasource.username}") String username,
            @Value("${spring.datasource.password}") String password) {
        
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName("org.postgresql.Driver");
        
        // 테스트 환경 최적화 설정
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(10000);
        config.setValidationTimeout(3000);
        
        // 연결 테스트 쿼리
        config.setConnectionTestQuery("SELECT 1");
        
        // 풀 이름 설정
        config.setPoolName("DBModeling-Test-Pool");
        
        // 테스트용 간소화 설정
        config.addDataSourceProperty("cachePrepStmts", "false");
        config.addDataSourceProperty("useServerPrepStmts", "false");
        
        return new HikariDataSource(config);
    }
    
    /**
     * 프로덕션 환경용 데이터소스 설정
     */
    @Bean
    @Primary
    @Profile("prod")
    @ConditionalOnProperty(name = "spring.datasource.url")
    public DataSource prodDataSource(
            @Value("${spring.datasource.url}") String url,
            @Value("${spring.datasource.username}") String username,
            @Value("${spring.datasource.password}") String password,
            @Value("${spring.datasource.hikari.maximum-pool-size:20}") int maxPoolSize,
            @Value("${spring.datasource.hikari.minimum-idle:10}") int minIdle) {
        
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName("org.postgresql.Driver");
        
        // 프로덕션 환경 최적화 설정
        config.setMaximumPoolSize(maxPoolSize);
        config.setMinimumIdle(minIdle);
        config.setIdleTimeout(600000); // 10분
        config.setConnectionTimeout(30000); // 30초
        config.setValidationTimeout(5000); // 5초
        config.setLeakDetectionThreshold(60000); // 1분
        
        // 연결 테스트 쿼리
        config.setConnectionTestQuery("SELECT 1");
        
        // 풀 이름 설정
        config.setPoolName("DBModeling-Prod-Pool");
        
        // 프로덕션 최적화 설정
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "500");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
        config.addDataSourceProperty("useServerPrepStmts", "true");
        config.addDataSourceProperty("useLocalSessionState", "true");
        config.addDataSourceProperty("rewriteBatchedStatements", "true");
        config.addDataSourceProperty("cacheResultSetMetadata", "true");
        config.addDataSourceProperty("cacheServerConfiguration", "true");
        config.addDataSourceProperty("elideSetAutoCommits", "true");
        config.addDataSourceProperty("maintainTimeStats", "false");
        
        // SSL 설정 (프로덕션 환경)
        config.addDataSourceProperty("sslmode", "require");
        config.addDataSourceProperty("ssl", "true");
        
        return new HikariDataSource(config);
    }
}