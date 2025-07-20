package com.dbmodeling;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 데이터베이스 연결 테스트
 */
@SpringBootTest
@ActiveProfiles("test")
class DatabaseConnectionTest {

    @Autowired
    private DataSource dataSource;

    @Test
    void testDatabaseConnection() throws SQLException {
        assertNotNull(dataSource, "DataSource가 null입니다");
        
        try (Connection connection = dataSource.getConnection()) {
            assertNotNull(connection, "데이터베이스 연결이 null입니다");
            assertFalse(connection.isClosed(), "데이터베이스 연결이 닫혀있습니다");
            
            DatabaseMetaData metaData = connection.getMetaData();
            System.out.println("=== 데이터베이스 연결 정보 ===");
            System.out.println("데이터베이스 제품명: " + metaData.getDatabaseProductName());
            System.out.println("데이터베이스 버전: " + metaData.getDatabaseProductVersion());
            System.out.println("드라이버 이름: " + metaData.getDriverName());
            System.out.println("드라이버 버전: " + metaData.getDriverVersion());
            System.out.println("연결 URL: " + metaData.getURL());
            System.out.println("사용자명: " + metaData.getUserName());
            System.out.println("========================");
            
            // PostgreSQL 연결 확인
            String dbProductName = metaData.getDatabaseProductName().toLowerCase();
            assertTrue(dbProductName.contains("postgresql") || dbProductName.contains("h2"),
                    "예상하지 못한 데이터베이스에 연결되었습니다: " + metaData.getDatabaseProductName());
        }
    }

    @Test
    void testDatabaseSchema() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            // 스키마 존재 확인
            DatabaseMetaData metaData = connection.getMetaData();
            var schemas = metaData.getSchemas();
            
            boolean publicSchemaExists = false;
            System.out.println("=== 사용 가능한 스키마 ===");
            while (schemas.next()) {
                String schemaName = schemas.getString("TABLE_SCHEM");
                System.out.println("스키마: " + schemaName);
                if ("public".equalsIgnoreCase(schemaName)) {
                    publicSchemaExists = true;
                }
            }
            
            assertTrue(publicSchemaExists, "public 또는 PUBLIC 스키마가 존재하지 않습니다");
            System.out.println("=====================");
        }
    }
}