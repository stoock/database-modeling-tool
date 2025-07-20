package com.dbmodeling.infrastructure.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * 데이터베이스 설정
 */
@Configuration
@EnableJpaRepositories(basePackages = "com.dbmodeling.infrastructure.persistence.repository")
@EntityScan(basePackages = "com.dbmodeling.infrastructure.persistence.entity")
@EnableJpaAuditing
@EnableTransactionManagement
public class DatabaseConfig {
}