package com.dbmodeling.presentation.controller;

import com.dbmodeling.DatabaseModelingToolApplication;
import com.dbmodeling.domain.model.*;
import com.dbmodeling.domain.repository.ProjectRepository;
import com.dbmodeling.domain.repository.TableRepository;
import com.dbmodeling.domain.repository.ColumnRepository;
import com.dbmodeling.presentation.dto.request.ValidationRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * ValidationController 통합 테스트
 */
@SpringBootTest(classes = DatabaseModelingToolApplication.class)
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class ValidationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TableRepository tableRepository;

    @Autowired
    private ColumnRepository columnRepository;

    private Project testProject;
    private Table testTable;

    @BeforeEach
    void setUp() {
        // 테스트용 프로젝트 생성
        testProject = new Project();
        testProject.setName("검증 테스트 프로젝트");
        testProject.setDescription("네이밍 규칙 검증 테스트용 프로젝트");
        
        NamingRules namingRules = new NamingRules();
        namingRules.setTablePrefix("tbl_");
        namingRules.setTablePattern("^[A-Z][a-zA-Z0-9]*$");
        namingRules.setColumnPattern("^[a-z][a-z0-9_]*$");
        namingRules.setIndexPattern("^IX_[A-Z][a-zA-Z0-9]*_[a-zA-Z0-9]+$");
        namingRules.setEnforceCase(NamingRules.CaseRule.PASCAL);
        testProject.setNamingRules(namingRules);
        
        testProject = projectRepository.save(testProject);

        // 테스트용 테이블 생성
        testTable = new Table();
        testTable.setProjectId(testProject.getId());
        testTable.setName("user"); // 네이밍 규칙 위반 (접두사 없음, 소문자)
        testTable.setDescription("사용자 테이블");
        testTable.setPositionX(100);
        testTable.setPositionY(100);
        testTable.setColumns(new ArrayList<>());
        testTable.setIndexes(new ArrayList<>());
        
        testTable = tableRepository.save(testTable);

        // 테스트용 컬럼 생성
        Column testColumn = new Column();
        testColumn.setTableId(testTable.getId());
        testColumn.setName("UserName"); // 네이밍 규칙 위반 (PascalCase)
        testColumn.setDataType(MSSQLDataType.NVARCHAR);
        testColumn.setMaxLength(255);
        testColumn.setNullable(false);
        testColumn.setPrimaryKey(false);
        testColumn.setIdentity(false);
        testColumn.setOrderIndex(1);
        
        columnRepository.save(testColumn);
    }

    @Test
    @DisplayName("테이블명 검증 - 네이밍 규칙 위반")
    void validateTableName_Violation() throws Exception {
        ValidationRequest request = new ValidationRequest();
        request.setName("user"); // 접두사 없음, 소문자
        request.setType("TABLE");

        mockMvc.perform(post("/api/projects/{projectId}/validation", testProject.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.valid").value(false))
                .andExpect(jsonPath("$.data.name").value("user"))
                .andExpect(jsonPath("$.data.type").value("TABLE"))
                .andExpect(jsonPath("$.data.errors").isArray())
                .andExpect(jsonPath("$.data.errors", hasSize(greaterThan(0))))
                .andExpected(jsonPath("$.data.suggestion").exists());
    }

    @Test
    @DisplayName("테이블명 검증 - 네이밍 규칙 준수")
    void validateTableName_Valid() throws Exception {
        ValidationRequest request = new ValidationRequest();
        request.setName("tbl_User"); // 올바른 형식
        request.setType("TABLE");

        mockMvc.perform(post("/api/projects/{projectId}/validation", testProject.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.valid").value(true))
                .andExpect(jsonPath("$.data.name").value("tbl_User"))
                .andExpect(jsonPath("$.data.type").value("TABLE"))
                .andExpect(jsonPath("$.data.errors").isEmpty());
    }

    @Test
    @DisplayName("컬럼명 검증 - 네이밍 규칙 위반")
    void validateColumnName_Violation() throws Exception {
        ValidationRequest request = new ValidationRequest();
        request.setName("UserName"); // PascalCase (snake_case 규칙 위반)
        request.setType("COLUMN");

        mockMvc.perform(post("/api/projects/{projectId}/validation", testProject.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.valid").value(false))
                .andExpect(jsonPath("$.data.name").value("UserName"))
                .andExpect(jsonPath("$.data.type").value("COLUMN"))
                .andExpect(jsonPath("$.data.errors").isArray())
                .andExpect(jsonPath("$.data.errors", hasSize(greaterThan(0))));
    }

    @Test
    @DisplayName("컬럼명 검증 - 네이밍 규칙 준수")
    void validateColumnName_Valid() throws Exception {
        ValidationRequest request = new ValidationRequest();
        request.setName("user_name"); // 올바른 snake_case 형식
        request.setType("COLUMN");

        mockMvc.perform(post("/api/projects/{projectId}/validation", testProject.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.valid").value(true))
                .andExpect(jsonPath("$.data.name").value("user_name"))
                .andExpect(jsonPath("$.data.type").value("COLUMN"))
                .andExpect(jsonPath("$.data.errors").isEmpty());
    }

    @Test
    @DisplayName("인덱스명 검증 - 네이밍 규칙 위반")
    void validateIndexName_Violation() throws Exception {
        ValidationRequest request = new ValidationRequest();
        request.setName("idx_user_name"); // IX_ 접두사 없음
        request.setType("INDEX");

        mockMvc.perform(post("/api/projects/{projectId}/validation", testProject.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.valid").value(false))
                .andExpect(jsonPath("$.data.name").value("idx_user_name"))
                .andExpect(jsonPath("$.data.type").value("INDEX"))
                .andExpect(jsonPath("$.data.errors").isArray())
                .andExpect(jsonPath("$.data.errors", hasSize(greaterThan(0))));
    }

    @Test
    @DisplayName("인덱스명 검증 - 네이밍 규칙 준수")
    void validateIndexName_Valid() throws Exception {
        ValidationRequest request = new ValidationRequest();
        request.setName("IX_User_Name"); // 올바른 형식
        request.setType("INDEX");

        mockMvc.perform(post("/api/projects/{projectId}/validation", testProject.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.valid").value(true))
                .andExpect(jsonPath("$.data.name").value("IX_User_Name"))
                .andExpect(jsonPath("$.data.type").value("INDEX"))
                .andExpect(jsonPath("$.data.errors").isEmpty());
    }

    @Test
    @DisplayName("프로젝트 전체 검증")
    void validateProject_Success() throws Exception {
        mockMvc.perform(post("/api/projects/{projectId}/validation/all", testProject.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.message").containsString("네이밍 규칙 위반"));
    }

    @Test
    @DisplayName("지원하지 않는 검증 타입")
    void validateName_UnsupportedType() throws Exception {
        ValidationRequest request = new ValidationRequest();
        request.setName("test_name");
        request.setType("UNSUPPORTED");

        mockMvc.perform(post("/api/projects/{projectId}/validation", testProject.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.valid").value(false))
                .andExpect(jsonPath("$.data.errors").isArray())
                .andExpect(jsonPath("$.data.errors[0].code").value("INVALID_TYPE"));
    }

    @Test
    @DisplayName("존재하지 않는 프로젝트로 검증 시 404 오류")
    void validateName_ProjectNotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        
        ValidationRequest request = new ValidationRequest();
        request.setName("test_name");
        request.setType("TABLE");

        mockMvc.perform(post("/api/projects/{projectId}/validation", nonExistentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("잘못된 요청 데이터로 검증 시 400 오류")
    void validateName_InvalidRequest() throws Exception {
        ValidationRequest request = new ValidationRequest();
        // name과 type을 비워둠

        mockMvc.perform(post("/api/projects/{projectId}/validation", testProject.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }
}