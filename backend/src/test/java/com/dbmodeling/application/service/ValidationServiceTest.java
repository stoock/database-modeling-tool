package com.dbmodeling.application.service;

import com.dbmodeling.application.service.ValidationService.ValidationError;
import com.dbmodeling.application.service.ValidationService.ValidationResult;
import com.dbmodeling.domain.model.*;
import com.dbmodeling.domain.repository.ColumnRepository;
import com.dbmodeling.domain.repository.IndexRepository;
import com.dbmodeling.domain.repository.ProjectRepository;
import com.dbmodeling.domain.repository.TableRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("ValidationService 테스트")
class ValidationServiceTest {
    
    @Mock
    private ProjectRepository projectRepository;
    
    @Mock
    private TableRepository tableRepository;
    
    @Mock
    private ColumnRepository columnRepository;
    
    @Mock
    private IndexRepository indexRepository;
    
    @InjectMocks
    private ValidationService validationService;
    
    private UUID projectId;
    private UUID tableId;
    private Project testProject;
    private Table testTable;
    private NamingRules namingRules;
    
    @BeforeEach
    void setUp() {
        projectId = UUID.randomUUID();
        tableId = UUID.randomUUID();
        
        // 네이밍 규칙 설정
        namingRules = new NamingRules();
        namingRules.setTablePattern("^[A-Z][a-zA-Z0-9]*$"); // PascalCase
        namingRules.setColumnPattern("^[a-z][a-z0-9_]*$"); // snake_case
        namingRules.setIndexPattern("^IX_.*$"); // IX_ 접두사
        namingRules.setEnforceCase(NamingRules.CaseType.PASCAL);
        
        // SQL Server 특화 규칙 설정
        namingRules.setEnforceUpperCase(false);
        namingRules.setRecommendAuditColumns(false);
        namingRules.setRequireDescription(false);
        namingRules.setEnforceTableColumnNaming(false);
        namingRules.setEnforceConstraintNaming(false);
        
        // 테스트 프로젝트 설정
        testProject = new Project("Test Project", "테스트 프로젝트");
        testProject.setId(projectId);
        testProject.setNamingRules(namingRules);
        
        // 테스트 테이블 설정
        testTable = new Table("TestTable", "테스트 테이블");
        testTable.setId(tableId);
        testTable.setProjectId(projectId);
    }
    
    @Test
    @DisplayName("프로젝트 전체 검증 - 성공")
    void validateProject_Success() {
        // Given
        Column validColumn = new Column("user_id", MSSQLDataType.BIGINT, 0);
        validColumn.setPrimaryKey(true);
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(tableRepository.findByProjectId(projectId)).thenReturn(Arrays.asList(testTable));
        when(columnRepository.findByTableIdOrderByOrderIndex(tableId)).thenReturn(Arrays.asList(validColumn));
        when(indexRepository.findByTableId(tableId)).thenReturn(Collections.emptyList());
        
        // When
        ValidationResult result = validationService.validateProject(projectId);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getProjectId()).isEqualTo(projectId);
        assertThat(result.isValid()).isTrue();
        assertThat(result.getErrors()).isEmpty();
    }
    
    @Test
    @DisplayName("프로젝트 검증 - 네이밍 규칙 위반")
    void validateProject_NamingRuleViolation() {
        // Given
        Table invalidTable = new Table("invalid_table", "잘못된 테이블"); // snake_case (규칙 위반)
        invalidTable.setId(UUID.randomUUID());
        invalidTable.setProjectId(projectId);
        
        Column invalidColumn = new Column("InvalidColumn", MSSQLDataType.NVARCHAR, 0); // PascalCase (규칙 위반)
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(tableRepository.findByProjectId(projectId)).thenReturn(Arrays.asList(invalidTable));
        when(columnRepository.findByTableIdOrderByOrderIndex(invalidTable.getId()))
            .thenReturn(Arrays.asList(invalidColumn));
        when(indexRepository.findByTableId(invalidTable.getId())).thenReturn(Collections.emptyList());
        
        // When
        ValidationResult result = validationService.validateProject(projectId);
        
        // Then
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).hasSize(2);
        
        // 테이블 이름 오류 확인
        ValidationError tableError = result.getErrors().stream()
            .filter(error -> error.getObjectType().equals("TABLE"))
            .findFirst().orElse(null);
        assertThat(tableError).isNotNull();
        assertThat(tableError.getObjectName()).isEqualTo("invalid_table");
        
        // 컬럼 이름 오류 확인
        ValidationError columnError = result.getErrors().stream()
            .filter(error -> error.getObjectType().equals("COLUMN"))
            .findFirst().orElse(null);
        assertThat(columnError).isNotNull();
        assertThat(columnError.getObjectName()).isEqualTo("InvalidColumn");
    }
    
    @Test
    @DisplayName("프로젝트 검증 - 네이밍 규칙 미설정")
    void validateProject_NoNamingRules() {
        // Given
        testProject.setNamingRules(null);
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        
        // When
        ValidationResult result = validationService.validateProject(projectId);
        
        // Then
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).hasSize(1);
        assertThat(result.getErrors().get(0).getMessage()).contains("네이밍 규칙이 설정되지 않았습니다");
    }
    
    @Test
    @DisplayName("테이블 검증 - 기본키 없음 경고")
    void validateProject_NoPrimaryKeyWarning() {
        // Given
        Column columnWithoutPK = new Column("name", MSSQLDataType.NVARCHAR, 0);
        columnWithoutPK.setPrimaryKey(false);
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(tableRepository.findByProjectId(projectId)).thenReturn(Arrays.asList(testTable));
        when(columnRepository.findByTableIdOrderByOrderIndex(tableId))
            .thenReturn(Arrays.asList(columnWithoutPK));
        when(indexRepository.findByTableId(tableId)).thenReturn(Collections.emptyList());
        
        // When
        ValidationResult result = validationService.validateProject(projectId);
        
        // Then
        assertThat(result.hasWarnings()).isTrue();
        assertThat(result.getWarnings()).hasSize(1);
        assertThat(result.getWarnings().get(0).getMessage()).contains("기본키가 정의되지 않았습니다");
    }
    
    @Test
    @DisplayName("컬럼 데이터 타입 검증 - 길이 누락")
    void validateProject_MissingLength() {
        // Given
        Column columnWithoutLength = new Column("name", MSSQLDataType.NVARCHAR, 0);
        columnWithoutLength.setMaxLength(null); // 길이 누락
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(tableRepository.findByProjectId(projectId)).thenReturn(Arrays.asList(testTable));
        when(columnRepository.findByTableIdOrderByOrderIndex(tableId))
            .thenReturn(Arrays.asList(columnWithoutLength));
        when(indexRepository.findByTableId(tableId)).thenReturn(Collections.emptyList());
        
        // When
        ValidationResult result = validationService.validateProject(projectId);
        
        // Then
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors().stream()
            .anyMatch(error -> error.getMessage().contains("길이 지정이 필요합니다")))
            .isTrue();
    }
    
    @Test
    @DisplayName("컬럼 데이터 타입 검증 - IDENTITY 지원하지 않는 타입")
    void validateProject_UnsupportedIdentityType() {
        // Given
        Column identityColumn = new Column("id", MSSQLDataType.NVARCHAR, 0);
        identityColumn.setIdentity(true); // NVARCHAR는 IDENTITY 지원하지 않음
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(tableRepository.findByProjectId(projectId)).thenReturn(Arrays.asList(testTable));
        when(columnRepository.findByTableIdOrderByOrderIndex(tableId))
            .thenReturn(Arrays.asList(identityColumn));
        when(indexRepository.findByTableId(tableId)).thenReturn(Collections.emptyList());
        
        // When
        ValidationResult result = validationService.validateProject(projectId);
        
        // Then
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors().stream()
            .anyMatch(error -> error.getMessage().contains("IDENTITY를 지원하지 않습니다")))
            .isTrue();
    }
    
    @Test
    @DisplayName("단일 테이블 검증")
    void validateTable_Success() {
        // Given
        Column validColumn = new Column("user_id", MSSQLDataType.BIGINT, 0);
        validColumn.setPrimaryKey(true);
        
        when(tableRepository.findById(tableId)).thenReturn(Optional.of(testTable));
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(columnRepository.findByTableIdOrderByOrderIndex(tableId)).thenReturn(Arrays.asList(validColumn));
        when(indexRepository.findByTableId(tableId)).thenReturn(Collections.emptyList());
        
        // When
        ValidationResult result = validationService.validateTable(tableId);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.isValid()).isTrue();
    }
    
    @Test
    @DisplayName("실시간 네이밍 검증 - 테이블 이름 유효")
    void validateName_ValidTableName() {
        // Given
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        
        // When
        ValidationError result = validationService.validateName(projectId, "TABLE", "UserTable");
        
        // Then
        assertThat(result).isNull(); // 검증 통과
    }
    
    @Test
    @DisplayName("실시간 네이밍 검증 - 테이블 이름 무효")
    void validateName_InvalidTableName() {
        // Given
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        
        // When
        ValidationError result = validationService.validateName(projectId, "TABLE", "user_table");
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getObjectType()).isEqualTo("TABLE");
        assertThat(result.getObjectName()).isEqualTo("user_table");
        assertThat(result.getMessage()).contains("네이밍 규칙을 위반했습니다");
        assertThat(result.getSuggestion()).isNotNull();
    }
    
    @Test
    @DisplayName("실시간 네이밍 검증 - 컬럼 이름 유효")
    void validateName_ValidColumnName() {
        // Given
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        
        // When
        ValidationError result = validationService.validateName(projectId, "COLUMN", "user_id");
        
        // Then
        assertThat(result).isNull(); // 검증 통과
    }
    
    @Test
    @DisplayName("실시간 네이밍 검증 - 프로젝트 없음")
    void validateName_ProjectNotFound() {
        // Given
        when(projectRepository.findById(projectId)).thenReturn(Optional.empty());
        
        // When & Then
        assertThatThrownBy(() -> validationService.validateName(projectId, "TABLE", "TestTable"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("프로젝트를 찾을 수 없습니다");
    }
    
    @Test
    @DisplayName("중복 컬럼 이름 검증")
    void validateProject_DuplicateColumnNames() {
        // Given
        Column column1 = new Column("name", MSSQLDataType.NVARCHAR, 0);
        Column column2 = new Column("NAME", MSSQLDataType.NVARCHAR, 1); // 대소문자 다르지만 중복
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(tableRepository.findByProjectId(projectId)).thenReturn(Arrays.asList(testTable));
        when(columnRepository.findByTableIdOrderByOrderIndex(tableId))
            .thenReturn(Arrays.asList(column1, column2));
        when(indexRepository.findByTableId(tableId)).thenReturn(Collections.emptyList());
        
        // When
        ValidationResult result = validationService.validateProject(projectId);
        
        // Then
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors().stream()
            .anyMatch(error -> error.getMessage().contains("중복된 컬럼 이름입니다")))
            .isTrue();
    }
    
    @Test
    @DisplayName("SQL Server 대문자 강제 검증 - 테이블명")
    void validateProject_SqlServerUpperCaseTable() {
        // Given
        namingRules.setEnforceUpperCase(true);
        Table lowercaseTable = new Table("user_table", "사용자 테이블");
        lowercaseTable.setId(UUID.randomUUID());
        lowercaseTable.setProjectId(projectId);
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(tableRepository.findByProjectId(projectId)).thenReturn(Arrays.asList(lowercaseTable));
        when(columnRepository.findByTableIdOrderByOrderIndex(lowercaseTable.getId()))
            .thenReturn(Collections.emptyList());
        when(indexRepository.findByTableId(lowercaseTable.getId())).thenReturn(Collections.emptyList());
        
        // When
        ValidationResult result = validationService.validateProject(projectId);
        
        // Then
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors().stream()
            .anyMatch(error -> error.getErrorType() == ValidationError.ErrorType.SQL_SERVER_NAMING))
            .isTrue();
    }
    
    @Test
    @DisplayName("SQL Server 감사 컬럼 권장 검증")
    void validateProject_SqlServerAuditColumns() {
        // Given
        namingRules.setRecommendAuditColumns(true);
        
        // 감사 컬럼이 없는 테이블
        Column normalColumn = new Column("user_id", MSSQLDataType.BIGINT, 0);
        normalColumn.setPrimaryKey(true);
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(tableRepository.findByProjectId(projectId)).thenReturn(Arrays.asList(testTable));
        when(columnRepository.findByTableIdOrderByOrderIndex(tableId))
            .thenReturn(Arrays.asList(normalColumn));
        when(indexRepository.findByTableId(tableId)).thenReturn(Collections.emptyList());
        
        // When
        ValidationResult result = validationService.validateProject(projectId);
        
        // Then
        assertThat(result.hasWarnings()).isTrue();
        assertThat(result.getWarnings().stream()
            .anyMatch(warning -> warning.getErrorType() == ValidationError.ErrorType.SQL_SERVER_AUDIT))
            .isTrue();
    }
    
    @Test
    @DisplayName("SQL Server 기본키 명명 규칙 검증 - 단독명칭 경고")
    void validateProject_SqlServerPrimaryKeyNaming() {
        // Given
        namingRules.setEnforceTableColumnNaming(true);
        
        Column idColumn = new Column("ID", MSSQLDataType.BIGINT, 0);
        idColumn.setPrimaryKey(true); // 단독명칭 사용
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(tableRepository.findByProjectId(projectId)).thenReturn(Arrays.asList(testTable));
        when(columnRepository.findByTableIdOrderByOrderIndex(tableId))
            .thenReturn(Arrays.asList(idColumn));
        when(indexRepository.findByTableId(tableId)).thenReturn(Collections.emptyList());
        
        // When
        ValidationResult result = validationService.validateProject(projectId);
        
        // Then
        assertThat(result.hasWarnings()).isTrue();
        assertThat(result.getWarnings().stream()
            .anyMatch(warning -> warning.getErrorType() == ValidationError.ErrorType.SQL_SERVER_NAMING &&
                                warning.getMessage().contains("단독명칭")))
            .isTrue();
    }
    
    @Test
    @DisplayName("SQL Server Description 필수 검증")
    void validateProject_SqlServerRequireDescription() {
        // Given
        namingRules.setRequireDescription(true);
        
        // Description이 없는 테이블
        Table tableWithoutDesc = new Table("TestTable", null);
        tableWithoutDesc.setId(UUID.randomUUID());
        tableWithoutDesc.setProjectId(projectId);
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(tableRepository.findByProjectId(projectId)).thenReturn(Arrays.asList(tableWithoutDesc));
        when(columnRepository.findByTableIdOrderByOrderIndex(tableWithoutDesc.getId()))
            .thenReturn(Collections.emptyList());
        when(indexRepository.findByTableId(tableWithoutDesc.getId())).thenReturn(Collections.emptyList());
        
        // When
        ValidationResult result = validationService.validateProject(projectId);
        
        // Then
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors().stream()
            .anyMatch(error -> error.getErrorType() == ValidationError.ErrorType.SQL_SERVER_DESCRIPTION))
            .isTrue();
    }
    
    @Test
    @DisplayName("SQL Server 실시간 검증 - 컬럼명 대문자 강제")
    void validateSqlServerName_UpperCaseEnforcement() {
        // Given
        namingRules.setEnforceUpperCase(true);
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        
        // When
        ValidationError result = validationService.validateSqlServerName(
            projectId, "COLUMN", "user_id", "USER_TABLE");
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getErrorType()).isEqualTo(ValidationError.ErrorType.SQL_SERVER_NAMING);
        assertThat(result.getSuggestion()).isEqualTo("USER_ID");
    }
    
    @Test
    @DisplayName("SQL Server 실시간 검증 - 기본키 단독명칭 경고")
    void validateSqlServerName_PrimaryKeyNamingWarning() {
        // Given
        namingRules.setEnforceTableColumnNaming(true);
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        
        // When
        ValidationError result = validationService.validateSqlServerName(
            projectId, "COLUMN", "ID", "USER_TABLE");
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getErrorType()).isEqualTo(ValidationError.ErrorType.SQL_SERVER_NAMING);
        assertThat(result.getMessage()).contains("단독명칭");
        assertThat(result.getSuggestion()).contains("USER_TABLE_ID");
    }
}