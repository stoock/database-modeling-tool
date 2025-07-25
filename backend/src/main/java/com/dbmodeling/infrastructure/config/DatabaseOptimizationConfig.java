package com.dbmodeling.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;
import java.util.Properties;

/**
 * 데이터베이스 성능 최적화 설정
 */
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(basePackages = "com.dbmodeling.infrastructure.persistence.repository")
@ConfigurationProperties(prefix = "spring.jpa")
public class DatabaseOptimizationConfig {

    /**
     * JPA 성능 최적화 속성 설정
     */
    @Bean
    public Properties jpaProperties() {
        Properties properties = new Properties();
        
        // 배치 처리 최적화
        properties.setProperty("hibernate.jdbc.batch_size", "50");
        properties.setProperty("hibernate.order_inserts", "true");
        properties.setProperty("hibernate.order_updates", "true");
        properties.setProperty("hibernate.jdbc.batch_versioned_data", "true");
        
        // 쿼리 최적화
        properties.setProperty("hibernate.query.plan_cache_max_size", "2048");
        properties.setProperty("hibernate.query.plan_parameter_metadata_max_size", "128");
        
        // 2차 캐시 설정 (필요시)
        properties.setProperty("hibernate.cache.use_second_level_cache", "true");
        properties.setProperty("hibernate.cache.use_query_cache", "true");
        properties.setProperty("hibernate.cache.region.factory_class", 
            "org.hibernate.cache.jcache.JCacheRegionFactory");
        
        // 연결 풀 최적화
        properties.setProperty("hibernate.connection.provider_disables_autocommit", "true");
        
        // 통계 및 모니터링 (개발 환경에서만)
        properties.setProperty("hibernate.generate_statistics", "true");
        properties.setProperty("hibernate.session.events.log.LOG_QUERIES_SLOWER_THAN_MS", "100");
        
        return properties;
    }

    /**
     * 트랜잭션 매니저 설정
     */
    @Bean
    public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(entityManagerFactory);
        
        // 트랜잭션 타임아웃 설정 (30초)
        transactionManager.setDefaultTimeout(30);
        
        return transactionManager;
    }
}