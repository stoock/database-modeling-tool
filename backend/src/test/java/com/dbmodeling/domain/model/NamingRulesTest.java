package com.dbmodeling.domain.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * 네이밍 규칙 도메인 모델 테스트
 */
class NamingRulesTest {

    @Test
    void 기본_네이밍_규칙_생성_테스트() {
        // Given & When
        NamingRules namingRules = new NamingRules();

        // Then
        assertEquals(NamingRules.CaseType.PASCAL, namingRules.getEnforceCase());
    }

    @Test
    void 네이밍_규칙_생성자_테스트() {
        // Given
        String tablePattern = "^[A-Z][a-zA-Z0-9]*$";
        String columnPattern = "^[a-z][a-z0-9_]*$";
        String indexPattern = "^IX_[A-Z][a-zA-Z0-9_]*$";
        NamingRules.CaseType caseType = NamingRules.CaseType.SNAKE;

        // When
        NamingRules namingRules = new NamingRules(tablePattern, columnPattern, indexPattern, caseType);

        // Then
        assertEquals(tablePattern, namingRules.getTablePattern());
        assertEquals(columnPattern, namingRules.getColumnPattern());
        assertEquals(indexPattern, namingRules.getIndexPattern());
        assertEquals(caseType, namingRules.getEnforceCase());
    }

    @Test
    void null_케이스타입_기본값_설정_테스트() {
        // Given & When
        NamingRules namingRules = new NamingRules("", "", "", null);

        // Then
        assertEquals(NamingRules.CaseType.PASCAL, namingRules.getEnforceCase());
    }

    @Test
    void 테이블명_검증_성공_테스트() {
        // Given
        NamingRules namingRules = new NamingRules();
        namingRules.setTablePrefix("TB_");
        namingRules.setTableSuffix("_INFO");
        namingRules.setEnforceCase(NamingRules.CaseType.UPPER);

        // When & Then
        assertTrue(namingRules.validateTableName("TB_USER_INFO"));
    }

    @Test
    void 테이블명_접두사_검증_실패_테스트() {
        // Given
        NamingRules namingRules = new NamingRules();
        namingRules.setTablePrefix("TB_");

        // When & Then
        assertFalse(namingRules.validateTableName("USER"));
    }

    @Test
    void 테이블명_접미사_검증_실패_테스트() {
        // Given
        NamingRules namingRules = new NamingRules();
        namingRules.setTableSuffix("_INFO");

        // When & Then
        assertFalse(namingRules.validateTableName("USER"));
    }

    @Test
    void 테이블명_패턴_검증_테스트() {
        // Given
        NamingRules namingRules = new NamingRules();
        namingRules.setTablePattern("^[A-Z][a-zA-Z0-9]*$"); // PascalCase 패턴

        // When & Then
        assertTrue(namingRules.validateTableName("User"));
        assertTrue(namingRules.validateTableName("UserProfile"));
        assertFalse(namingRules.validateTableName("user")); // 소문자 시작
        assertFalse(namingRules.validateTableName("user_profile")); // 언더스코어 포함
    }

    @Test
    void 컬럼명_검증_테스트() {
        // Given
        NamingRules namingRules = new NamingRules();
        namingRules.setColumnPattern("^[a-z][a-z0-9_]*$"); // snake_case 패턴
        namingRules.setEnforceCase(NamingRules.CaseType.SNAKE);

        // When & Then
        assertTrue(namingRules.validateColumnName("user_id"));
        assertTrue(namingRules.validateColumnName("created_at"));
        assertFalse(namingRules.validateColumnName("UserId")); // PascalCase
        assertFalse(namingRules.validateColumnName("User_Id")); // 대문자 포함
    }

    @Test
    void 인덱스명_검증_테스트() {
        // Given
        NamingRules namingRules = new NamingRules();
        namingRules.setIndexPattern("^IX_[A-Z][a-zA-Z0-9_]*$");
        namingRules.setEnforceCase(null); // 인덱스명은 패턴만 검증

        // When & Then
        assertTrue(namingRules.validateIndexName("IX_User_Email"));
        assertTrue(namingRules.validateIndexName("IX_UserProfile_Name"));
        assertFalse(namingRules.validateIndexName("User_Email")); // IX_ 접두사 없음
        assertFalse(namingRules.validateIndexName("IX_user_email")); // 소문자 시작
    }

    @Test
    void null_또는_빈_문자열_검증_실패_테스트() {
        // Given
        NamingRules namingRules = new NamingRules();

        // When & Then
        assertFalse(namingRules.validateTableName(null));
        assertFalse(namingRules.validateTableName(""));
        assertFalse(namingRules.validateTableName("   "));
        
        assertFalse(namingRules.validateColumnName(null));
        assertFalse(namingRules.validateColumnName(""));
        
        assertFalse(namingRules.validateIndexName(null));
        assertFalse(namingRules.validateIndexName(""));
    }

    @Test
    void PASCAL_케이스_검증_테스트() {
        // Given
        NamingRules namingRules = new NamingRules();
        namingRules.setEnforceCase(NamingRules.CaseType.PASCAL);

        // When & Then
        assertTrue(namingRules.validateTableName("User"));
        assertTrue(namingRules.validateTableName("UserProfile"));
        assertFalse(namingRules.validateTableName("user"));
        assertFalse(namingRules.validateTableName("user_profile"));
        assertFalse(namingRules.validateTableName("User-Profile"));
    }

    @Test
    void SNAKE_케이스_검증_테스트() {
        // Given
        NamingRules namingRules = new NamingRules();
        namingRules.setEnforceCase(NamingRules.CaseType.SNAKE);

        // When & Then
        assertTrue(namingRules.validateColumnName("user_id"));
        assertTrue(namingRules.validateColumnName("created_at"));
        assertFalse(namingRules.validateColumnName("UserId"));
        assertFalse(namingRules.validateColumnName("user-id"));
        assertFalse(namingRules.validateColumnName("user id"));
    }

    @Test
    void UPPER_케이스_검증_테스트() {
        // Given
        NamingRules namingRules = new NamingRules();
        namingRules.setEnforceCase(NamingRules.CaseType.UPPER);

        // When & Then
        assertTrue(namingRules.validateTableName("USER"));
        assertTrue(namingRules.validateTableName("USER_PROFILE"));
        assertFalse(namingRules.validateTableName("User"));
        assertFalse(namingRules.validateTableName("user"));
    }

    @Test
    void LOWER_케이스_검증_테스트() {
        // Given
        NamingRules namingRules = new NamingRules();
        namingRules.setEnforceCase(NamingRules.CaseType.LOWER);

        // When & Then
        assertTrue(namingRules.validateTableName("user"));
        assertTrue(namingRules.validateTableName("userprofile"));
        assertFalse(namingRules.validateTableName("User"));
        assertFalse(namingRules.validateTableName("USER"));
    }

    @Test
    void 테이블명_제안_테스트() {
        // Given
        NamingRules namingRules = new NamingRules();
        namingRules.setTablePrefix("TB_");
        namingRules.setTableSuffix("_INFO");
        namingRules.setEnforceCase(NamingRules.CaseType.UPPER);

        // When
        String suggested = namingRules.suggestTableName("user");

        // Then
        assertEquals("TB_USER_INFO", suggested);
    }

    @Test
    void 컬럼명_제안_테스트() {
        // Given
        NamingRules namingRules = new NamingRules();
        namingRules.setEnforceCase(NamingRules.CaseType.SNAKE);

        // When
        String suggested = namingRules.suggestColumnName("UserId");

        // Then
        assertEquals("user_id", suggested);
    }

    @Test
    void 인덱스명_제안_테스트() {
        // Given
        NamingRules namingRules = new NamingRules();
        namingRules.setEnforceCase(NamingRules.CaseType.PASCAL);

        // When
        String suggested = namingRules.suggestIndexName("user", "email");

        // Then
        assertEquals("IxUserEmail", suggested);
    }

    @Test
    void PASCAL_케이스_변환_테스트() {
        // Given
        NamingRules namingRules = new NamingRules();
        namingRules.setEnforceCase(NamingRules.CaseType.PASCAL);

        // When & Then
        assertEquals("UserProfile", namingRules.suggestTableName("user_profile"));
        assertEquals("UserProfile", namingRules.suggestTableName("user-profile"));
        assertEquals("UserProfile", namingRules.suggestTableName("user profile"));
        assertEquals("UserId", namingRules.suggestTableName("userId"));
    }

    @Test
    void SNAKE_케이스_변환_테스트() {
        // Given
        NamingRules namingRules = new NamingRules();
        namingRules.setEnforceCase(NamingRules.CaseType.SNAKE);

        // When & Then
        assertEquals("user_profile", namingRules.suggestColumnName("UserProfile"));
        assertEquals("user_profile", namingRules.suggestColumnName("user-profile"));
        assertEquals("user_profile", namingRules.suggestColumnName("user profile"));
        assertEquals("user_id", namingRules.suggestColumnName("userId"));
    }

    @Test
    void null_입력_제안_테스트() {
        // Given
        NamingRules namingRules = new NamingRules();

        // When & Then
        assertNull(namingRules.suggestTableName(null));
        assertNull(namingRules.suggestColumnName(null));
        assertNull(namingRules.suggestIndexName(null, "column"));
        assertNull(namingRules.suggestIndexName("table", null));
    }

    @Test
    void 케이스타입_이름_테스트() {
        // When & Then
        assertEquals("UPPER", NamingRules.CaseType.UPPER.getName());
        assertEquals("LOWER", NamingRules.CaseType.LOWER.getName());
        assertEquals("PASCAL", NamingRules.CaseType.PASCAL.getName());
        assertEquals("SNAKE", NamingRules.CaseType.SNAKE.getName());
    }
}