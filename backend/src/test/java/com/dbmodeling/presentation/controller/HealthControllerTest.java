package com.dbmodeling.presentation.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("헬스 체크 컨트롤러 테스트")
class HealthControllerTest {

    @Mock
    private DataSource dataSource;

    @Mock
    private Connection connection;

    @InjectMocks
    private HealthController healthController;

    @BeforeEach
    void setUp() {
        // DataSource를 수동으로 주입
        healthController.dataSource = dataSource;
    }

    @Test
    @DisplayName("헬스 체크 - 정상 상태")
    void health_Success() throws SQLException {
        // Given
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.isValid(3)).thenReturn(true);

        // When
        ResponseEntity<Map<String, Object>> response = healthController.health();

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo("UP");
        assertThat(response.getBody().get("database")).isEqualTo("UP");
        assertThat(response.getBody().get("service")).isEqualTo("Database Modeling Tool API");
        assertThat(response.getBody().get("version")).isEqualTo("1.0.0");
        assertThat(response.getBody().get("timestamp")).isNotNull();

        verify(dataSource).getConnection();
        verify(connection).isValid(3);
        verify(connection).close();
    }

    @Test
    @DisplayName("헬스 체크 - 데이터베이스 연결 실패")
    void health_DatabaseConnectionFailed() throws SQLException {
        // Given
        when(dataSource.getConnection()).thenThrow(new SQLException("Connection failed"));

        // When
        ResponseEntity<Map<String, Object>> response = healthController.health();

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo("DEGRADED");
        assertThat(response.getBody().get("database")).isEqualTo("DOWN");
        assertThat(response.getBody().get("message")).asString()
            .contains("PostgreSQL 데이터베이스에 연결할 수 없습니다");
        assertThat(response.getBody().get("hint")).isNotNull();

        verify(dataSource).getConnection();
    }

    @Test
    @DisplayName("헬스 체크 - 데이터베이스 연결이 유효하지 않음")
    void health_DatabaseConnectionInvalid() throws SQLException {
        // Given
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.isValid(3)).thenReturn(false);

        // When
        ResponseEntity<Map<String, Object>> response = healthController.health();

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo("DEGRADED");
        assertThat(response.getBody().get("database")).isEqualTo("DOWN");

        verify(dataSource).getConnection();
        verify(connection).isValid(3);
        verify(connection).close();
    }

    @Test
    @DisplayName("헬스 체크 - isValid 호출 중 예외 발생")
    void health_IsValidThrowsException() throws SQLException {
        // Given
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.isValid(3)).thenThrow(new SQLException("Validation failed"));

        // When
        ResponseEntity<Map<String, Object>> response = healthController.health();

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo("DEGRADED");
        assertThat(response.getBody().get("database")).isEqualTo("DOWN");

        verify(dataSource).getConnection();
        verify(connection).isValid(3);
        verify(connection).close();
    }
}
