package com.dbmodeling.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.annotation.PersistenceExceptionTranslationPostProcessor;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import jakarta.persistence.EntityManagerFactory;
import java.util.Optional;

/**
 * JPA 관련 추가 설정
 * 트랜잭션 관리 및 감사 기능 설정
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
@EnableTransactionManagement
public class JpaConfig {

    /**
     * JPA 예외 변환 프로세서
     * JPA 관련 예외를 Spring의 DataAccessException으로 변환
     */
    @Bean
    public PersistenceExceptionTranslationPostProcessor exceptionTranslation() {
        return new PersistenceExceptionTranslationPostProcessor();
    }

    /**
     * JPA 트랜잭션 매니저
     * 트랜잭션 경계 관리
     */
    @Bean
    public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
        JpaTransactionManager txManager = new JpaTransactionManager();
        txManager.setEntityManagerFactory(entityManagerFactory);
        return txManager;
    }

    /**
     * 감사 정보 제공자
     * 현재 사용자 정보를 엔티티의 생성자/수정자 필드에 자동 주입
     */
    @Bean
    public AuditorAware<String> auditorProvider() {
        // 실제 인증 구현 시 SecurityContextHolder에서 사용자 정보를 가져오도록 수정
        return () -> Optional.of("system");
    }
}