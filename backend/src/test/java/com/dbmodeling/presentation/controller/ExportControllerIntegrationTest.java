package com.dbmodeling.presentation.controller;

import com.dbmodeling.DatabaseModelingToolApplication;
import com.dbmodeling.domain.model.*;
import com.dbmodeling.domain.repository.ProjectRepository;
import com.dbmodeling.domain.repository.TableRepository;
import com.dbmodeling.domain.repository.ColumnRepository;
import com.dbmodeling.presentation.dto.request.ExportRequest;
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
 * ExportController 통합 테스트
 */
@SpringBootTest(classes = DatabaseModelingToolApplication.class)
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class ExportControllerIntegrationTest {

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
        testProject.setName("내보내기 테스트 프로젝트");
        testProject.setDescription("스키마 내보내기 테스트용 프로젝트");
        
        NamingRules namingRules = new NamingRules();
        namingRules.setTablePattern("^[A-Z][a-zA-Z0-9]*$");
        namingRules.setColumnPattern("^[a-z][a-z0-9_]*$");
        namingRules.setIndexPattern("^IX_[A-Z][a-zA-Z0-9]*_[a-zA-Z0-9]+$");
        namingRules.setEnforceCase(NamingRules.CaseRule.PASCAL);
        testProject.setNamingRules(namingRules);
        
        testProject = projectRepository.save(testProject);

        // 테스트용 테이블 생성
        testTable = new Table();
        testTable.setProjectId(testProject.getId());
        testTable.setName("User");
        testTable.setDescription("사용자 테이블");
        testTable.setPositionX(100);
        testTable.setPositionY(100);
        testTable.setColumns(new ArrayList<>());
        testTable.setIndexes(new ArrayList<>());
        
        testTable = tableRepository.save(testTable);

        // 테스트용 컬럼들 생성
        Column idColumn = new Column();
        idColumn.setTableId(testTable.getId());
        idColumn.setName("id");
        idColumn.setDataType(MSSQLDataType.INT);
        idColumn.setNullable(false);
        idColumn.setPrimaryKey(true);
        idColumn.setIdentity(true);
        idColumn.setIdentitySeed(1);
        idColumn.setIdentityIncrement(1);
        idColumn.setOrderIndex(0);
        columnRepository.save(idColumn);

        Column nameColumn = new Column();
        nameColumn.setTableId(testTable.getId());
        nameColumn.setName("name");
        nameColumn.setDataType(MSSQLDataType.NVARCHAR);
        nameColumn.setMaxLength(255);
        nameColumn.setNullable(false);
        nameColumn.setPrimaryKey(false);
        nameColumn.setIdentity(false);
        nameColumn.setOrderIndex(1);
        columnRepository.save(nameColumn);

        Column emailColumn = new Column();
        emailColumn.setTableId(testTable.getId());
        emailColumn.setName("email");
        emailColumn.setDataType(MSSQLDataType.NVARCHAR);
        emailColumn.setMaxLength(255);
        emailColumn.setNullable(true);
        emailColumn.setPrimaryKey(false);
        emailColumn.setIdentity(false);
        emailColumn.setOrderIndex(2);
        columnRepository.save(emailColumn);
    }

    @Test
    @DisplayName("SQL 스키마 미리보기 생성 성공")
    void previewSqlSchema_Success() throws Exception {
        ExportRequest request = new ExportRequest();
        request.setFormat("SQL");
        request.setIncludeComments(true);
        request.setIncludeIndexes(true);
        request.setIncludeConstraints(true);

        mockMvc.perform(post("/api/projects/{projectId}/export/preview", testProject.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.format").value("SQL"))
                .andExpect(jsonPath("$.data.content").isString())
                .andExpect(jsonPath("$.data.content").value(containsString("CREATE TABLE")))
                .andExpect(jsonPath("$.data.content").value(containsString("[User]")))
                .andExpect(jsonPath("$.data.content").value(containsString("[id]")))
                .andExpect(jsonPath("$.data.content").value(containsString("[name]")))
                .andExpected(jsonPath("$.data.content").value(containsString("[email]")))
                .andExpect(jsonPath("$.data.fileName").value(endsWith(".sql")))
                .andExpect(jsonPath("$.data.contentType").value("application/sql"))
                .andExpect(jsonPath("$.message").value("스키마 미리보기가 성공적으로 생성되었습니다."));
    }

    @Test
    @DisplayName("JSON 스키마 미리보기 생성 성공")
    void previewJsonSchema_Success() throws Exception {
        ExportRequest request = new ExportRequest();
        request.setFormat("JSON");
        request.setIncludeComments(true);
        request.setIncludeIndexes(true);
        request.setIncludeConstraints(true);

        mockMvc.perform(post("/api/projects/{projectId}/export/preview", testProject.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.format").value("JSON"))
                .andExpect(jsonPath("$.data.content").isString())
                .andExpect(jsonPath("$.data.fileName").value(endsWith(".json")))
                .andExpect(jsonPath("$.data.contentType").value("application/json"));
    }

    @Test
    @DisplayName("Markdown 스키마 미리보기 생성 성공")
    void previewMarkdownSchema_Success() throws Exception {
        ExportRequest request = new ExportRequest();
        request.setFormat("MARKDOWN");
        request.setIncludeComments(true);
        request.setIncludeIndexes(true);
        request.setIncludeConstraints(true);

        mockMvc.perform(post("/api/projects/{projectId}/export/preview", testProject.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.format").value("MARKDOWN"))
                .andExpect(jsonPath("$.data.content").isString())
                .andExpect(jsonPath("$.data.content").value(containsString("#")))
                .andExpect(jsonPath("$.data.fileName").value(endsWith(".md")))
                .andExpect(jsonPath("$.data.contentType").value("text/markdown"));
    }

    @Test
    @DisplayName("HTML 스키마 미리보기 생성 성공")
    void previewHtmlSchema_Success() throws Exception {
        ExportRequest request = new ExportRequest();
        request.setFormat("HTML");
        request.setIncludeComments(true);
        request.setIncludeIndexes(true);
        request.setIncludeConstraints(true);

        mockMvc.perform(post("/api/projects/{projectId}/export/preview", testProject.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.format").value("HTML"))
                .andExpect(jsonPath("$.data.content").isString())
                .andExpect(jsonPath("$.data.content").value(containsString("<html>")))
                .andExpect(jsonPath("$.data.fileName").value(endsWith(".html")))
                .andExpect(jsonPath("$.data.contentType").value("text/html"));
    }

    @Test
    @DisplayName("CSV 스키마 미리보기 생성 성공")
    void previewCsvSchema_Success() throws Exception {
        ExportRequest request = new ExportRequest();
        request.setFormat("CSV");
        request.setIncludeComments(true);
        request.setIncludeIndexes(true);
        request.setIncludeConstraints(true);

        mockMvc.perform(post("/api/projects/{projectId}/export/preview", testProject.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.format").value("CSV"))
                .andExpect(jsonPath("$.data.content").isString())
                .andExpect(jsonPath("$.data.fileName").value(endsWith(".csv")))
                .andExpect(jsonPath("$.data.contentType").value("text/csv"));
    }

    @Test
    @DisplayName("기본 옵션으로 스키마 미리보기 생성")
    void previewSchema_DefaultOptions() throws Exception {
        mockMvc.perform(post("/api/projects/{projectId}/export/preview", testProject.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.format").value("SQL")) // 기본값
                .andExpect(jsonPath("$.data.content").isString())
                .andExpect(jsonPath("$.data.fileName").value(endsWith(".sql")))
                .andExpect(jsonPath("$.data.contentType").value("application/sql"));
    }

    @Test
    @DisplayName("스키마 파일 다운로드 성공")
    void downloadSchema_Success() throws Exception {
        ExportRequest request = new ExportRequest();
        request.setFormat("SQL");
        request.setIncludeComments(true);
        request.setIncludeIndexes(true);
        request.setIncludeConstraints(true);

        mockMvc.perform(post("/api/projects/{projectId}/export/download", testProject.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/sql"))
                .andExpect(header().exists("Content-Disposition"))
                .andExpect(header().string("Content-Disposition", containsString("attachment")))
                .andExpect(header().string("Content-Disposition", containsString(".sql")))
                .andExpect(content().string(containsString("CREATE TABLE")));
    }

    @Test
    @DisplayName("지원되는 내보내기 형식 조회")
    void getSupportedFormats_Success() throws Exception {
        mockMvc.perform(get("/api/export/formats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.SQL").exists())
                .andExpect(jsonPath("$.data.SQL.description").value("MSSQL DDL 스크립트"))
                .andExpect(jsonPath("$.data.SQL.contentType").value("application/sql"))
                .andExpect(jsonPath("$.data.SQL.extension").value(".sql"))
                .andExpect(jsonPath("$.data.MARKDOWN").exists())
                .andExpect(jsonPath("$.data.HTML").exists())
                .andExpect(jsonPath("$.data.JSON").exists())
                .andExpect(jsonPath("$.data.CSV").exists())
                .andExpect(jsonPath("$.message").value("지원되는 내보내기 형식을 성공적으로 조회했습니다."));
    }

    @Test
    @DisplayName("지원하지 않는 형식으로 내보내기 시 400 오류")
    void previewSchema_UnsupportedFormat() throws Exception {
        ExportRequest request = new ExportRequest();
        request.setFormat("UNSUPPORTED");

        mockMvc.perform(post("/api/projects/{projectId}/export/preview", testProject.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.message").containsString("지원하지 않는 내보내기 형식"));
    }

    @Test
    @DisplayName("존재하지 않는 프로젝트로 내보내기 시 404 오류")
    void previewSchema_ProjectNotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        
        ExportRequest request = new ExportRequest();
        request.setFormat("SQL");

        mockMvc.perform(post("/api/projects/{projectId}/export/preview", nonExistentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("잘못된 UUID 형식으로 내보내기 시 404 오류")
    void previewSchema_InvalidUUID() throws Exception {
        ExportRequest request = new ExportRequest();
        request.setFormat("SQL");

        mockMvc.perform(post("/api/projects/{projectId}/export/preview", "invalid-uuid")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }
}