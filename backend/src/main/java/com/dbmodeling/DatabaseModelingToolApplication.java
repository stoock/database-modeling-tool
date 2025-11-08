package com.dbmodeling;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

import javax.sql.DataSource;
import java.sql.Connection;

@SpringBootApplication
public class DatabaseModelingToolApplication {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseModelingToolApplication.class);
    
    private final DataSource dataSource;
    
    public DatabaseModelingToolApplication(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public static void main(String[] args) {
        SpringApplication.run(DatabaseModelingToolApplication.class, args);
    }
    
    @EventListener(ApplicationReadyEvent.class)
    public void checkDatabaseConnection() {
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(3)) {
                logger.info("✅ PostgreSQL 데이터베이스 연결 성공");
                logger.info("📊 데이터베이스 URL: {}", connection.getMetaData().getURL());
            }
        } catch (Exception e) {
            logger.error("❌ PostgreSQL 데이터베이스 연결 실패!");
            logger.error("💡 해결 방법:");
            logger.error("   1. Docker 컨테이너 실행: docker-compose up -d");
            logger.error("   2. 또는 스크립트 실행: .\\scripts\\01-env-setup.ps1");
            logger.error("   3. PostgreSQL 상태 확인: docker ps");
            logger.error("오류 상세: {}", e.getMessage());
        }
    }
}