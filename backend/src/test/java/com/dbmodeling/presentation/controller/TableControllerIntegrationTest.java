package com.dbmodeling.presentation.controller;

import com.dbmodeling.domain.model.Project;
import com.dbmodeling.domain.model.Table;
import com.dbmodeling.domain.repository.ProjectRepository;
import com.dbmodeling.domain.repository.TableRepository;
import com.dbmodeling.presentation.dto.request.CreateTableRequest;
import com.dbmodeling.presentation.dto.request.UpdateTableRequest;
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

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * TableController 통합 테스트
 */
@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class TableControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TableRepository tableRepository;

    private Project testProject;
    private Table testTable;

    @BeforeEach
    void setUp() {
        // 테스트용 프로젝트 생성
        testProject = new Project("테스트 프로젝트", "테스트용 프로젝트입니다.");
        testProject = projectRepository.save(testProject);

        // 테스트용 테이블 생성
        testTable = new Table();
        testTable.setProjectId(testProject.getId());
        testTable.setName("TestTable");
        testTable.setDescription("테스트용 테이블입니다.");
        testTable.setPositionX(100);
        testTable.setPositionY(200);
        testTable = tableRepository.save(testTable);
    }

    @Test
    @DisplayName("프로젝트의 테이블 목록 조회 성공")
    void getTablesByProject_Success() throws Exception {
        mockMvc.perform(get("/api/projects/{projectId}/tables", testProject.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[0].id").exists())
                .andExpect(jsonPath("$.data[0].name").exists())
                .andExpect(jsonPath("$.message").value("테이블 목록을 성공적으로 조회했습니다."));
    }

    @Test
    @DisplayName("테이블 상세 조회 성공")
    void getTable_Success() throws Exception {
        mockMvc.perform(get("/api/tables/{id}", testTable.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(testTable.getId().toString()))
                .andExpect(jsonPath("$.data.name").value(testTable.getName()))
                .andExpect(jsonPath("$.data.description").value(testTable.getDescription()))
                .andExpect(jsonPath("$.data.positionX").value(testTable.getPositionX()))
                .andExpect(jsonPath("$.data.positionY").value(testTable.getPositionY()))
                .andExpect(jsonPath("$.message").value("테이블을 성공적으로 조회했습니다."));
    }

    @Test
    @DisplayName("존재하지 않는 테이블 조회 시 404 오류")
    void getTable_NotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        
        mockMvc.perform(get("/api/tables/{id}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("테이블 생성 성공")
    void createTable_Success() throws Exception {
        CreateTableRequest request = new CreateTableRequest(
            "NewTable",
            "새로운 테이블입니다.",
            150,
            250
        );

        mockMvc.perform(post("/api/projects/{projectId}/tables", testProject.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("NewTable"))
                .andExpect(jsonPath("$.data.description").value("새로운 테이블입니다."))
                .andExpect(jsonPath("$.data.positionX").value(150))
                .andExpect(jsonPath("$.data.positionY").value(250))
                .andExpect(jsonPath("$.message").value("테이블이 성공적으로 생성되었습니다."));
    }

    @Test
    @DisplayName("테이블 생성 시 필수 필드 누락으로 400 오류")
    void createTable_ValidationError() throws Exception {
        CreateTableRequest request = new CreateTableRequest();
        // name 필드 누락

        mockMvc.perform(post("/api/projects/{projectId}/tables", testProject.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("테이블 수정 성공")
    void updateTable_Success() throws Exception {
        UpdateTableRequest request = new UpdateTableRequest(
            "UpdatedTable",
            "수정된 테이블입니다.",
            300,
            400
        );

        mockMvc.perform(put("/api/tables/{id}", testTable.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("UpdatedTable"))
                .andExpect(jsonPath("$.data.description").value("수정된 테이블입니다."))
                .andExpect(jsonPath("$.data.positionX").value(300))
                .andExpect(jsonPath("$.data.positionY").value(400))
                .andExpect(jsonPath("$.message").value("테이블이 성공적으로 수정되었습니다."));
    }

    @Test
    @DisplayName("존재하지 않는 테이블 수정 시 404 오류")
    void updateTable_NotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        UpdateTableRequest request = new UpdateTableRequest(
            "UpdatedTable",
            "수정된 테이블입니다.",
            300,
            400
        );

        mockMvc.perform(put("/api/tables/{id}", nonExistentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("테이블 삭제 성공")
    void deleteTable_Success() throws Exception {
        mockMvc.perform(delete("/api/tables/{id}", testTable.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("존재하지 않는 테이블 삭제 시 404 오류")
    void deleteTable_NotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();

        mockMvc.perform(delete("/api/tables/{id}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("존재하지 않는 프로젝트의 테이블 목록 조회 시 404 오류")
    void getTablesByProject_ProjectNotFound() throws Exception {
        UUID nonExistentProjectId = UUID.randomUUID();

        mockMvc.perform(get("/api/projects/{projectId}/tables", nonExistentProjectId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }
}