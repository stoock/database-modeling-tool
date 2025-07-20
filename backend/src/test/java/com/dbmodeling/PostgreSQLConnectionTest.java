package com.dbmodeling;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * PostgreSQL 직접 연결 테스트
 * 시스템 속성 test.postgresql=true로 실행 시에만 활성화
 */
class PostgreSQLConnectionTest {

    private static final String URL = "jdbc:postgresql://localhost:5432/dbmodeling_test";
    private static final String USERNAME = "dbmodeling";
    private static final String PASSWORD = "dbmodeling";

    @Test
    @EnabledIfSystemProperty(named = "test.postgresql", matches = "true")
    void testDirectPostgreSQLConnection() throws SQLException {
        System.out.println("=== PostgreSQL 직접 연결 테스트 ===");
        
        try {
            // PostgreSQL 드라이버 로드
            Class.forName("org.postgresql.Driver");
            System.out.println("✓ PostgreSQL 드라이버 로드 성공");
            
            // 데이터베이스 연결 시도
            try (Connection connection = DriverManager.getConnection(URL, USERNAME, PASSWORD)) {
                System.out.println("✓ PostgreSQL 연결 성공!");
                System.out.println("연결 URL: " + URL);
                System.out.println("사용자명: " + USERNAME);
                System.out.println("연결 유효성: " + connection.isValid(5));
                
                // 데이터베이스 메타데이터 확인
                var metaData = connection.getMetaData();
                System.out.println("데이터베이스 제품명: " + metaData.getDatabaseProductName());
                System.out.println("데이터베이스 버전: " + metaData.getDatabaseProductVersion());
                System.out.println("드라이버 버전: " + metaData.getDriverVersion());
                
            } catch (SQLException e) {
                System.err.println("❌ PostgreSQL 연결 실패:");
                System.err.println("오류 코드: " + e.getErrorCode());
                System.err.println("SQL 상태: " + e.getSQLState());
                System.err.println("오류 메시지: " + e.getMessage());
                
                // 일반적인 연결 오류 원인 안내
                System.err.println("\n=== 연결 실패 가능한 원인 ===");
                System.err.println("1. PostgreSQL 서버가 실행되지 않음");
                System.err.println("2. 데이터베이스 'dbmodeling_test'가 존재하지 않음");
                System.err.println("3. 사용자 'dbmodeling'이 존재하지 않거나 권한 부족");
                System.err.println("4. 방화벽 또는 네트워크 설정 문제");
                System.err.println("5. PostgreSQL 설정에서 로컬 연결 허용 안됨");
                
                throw e;
            }
            
        } catch (ClassNotFoundException e) {
            System.err.println("❌ PostgreSQL 드라이버를 찾을 수 없습니다: " + e.getMessage());
            throw new RuntimeException("PostgreSQL 드라이버 로드 실패", e);
        }
        
        System.out.println("=== 테스트 완료 ===");
    }

    @Test
    void testConnectionInfo() {
        System.out.println("=== 연결 정보 ===");
        System.out.println("URL: " + URL);
        System.out.println("사용자명: " + USERNAME);
        System.out.println("비밀번호: " + (PASSWORD.isEmpty() ? "없음" : "설정됨"));
        System.out.println();
        System.out.println("PostgreSQL 연결 테스트를 실행하려면:");
        System.out.println("mvn test -Dtest=PostgreSQLConnectionTest -Dtest.postgresql=true");
    }
}