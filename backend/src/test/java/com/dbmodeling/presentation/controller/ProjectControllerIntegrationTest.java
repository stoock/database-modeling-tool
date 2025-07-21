package com.dbmodeling.presentation.controller;

import com.dbmodeling.domain.model.Project;
import com.dbmodeling.domain.repository.ProjectRepository;
import com.dbmodeling.presentation.dto.request.CreateProjectRequest;
import com.dbmodeling.presentation.dto.request.NamingRulesRequest;
import com.dbmodeling.presentation.dto.request.UpdateProjectRequest;
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
 * ProjectController 통합 테스트
 */
@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class ProjectControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProjectRepository projectRepository;

    private Project testProject;

    @BeforeEach
    void setUp() {
        // 테스트용 프로젝트 생성
        testProject = new Project("테스트 프로젝트", "테스트용 프로젝트입니다.");
        testProject = projectRepository.save(testProject);
    }

    @Test
    @DisplayName("프로젝트 목록 조회 성공")
    void getAllProjects_Success() throws Exception {
        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[0].id").exists())
                .andExpect(jsonPath("$.data[0].name").exists())
                .andExpect(jsonPath("$.message").value("프로젝트 목록을 성공적으로 조회했습니다."));
    }

    @Test
    @DisplayName("프로젝트 상세 조회 성공")
    void getProject_Success() throws Exception {
        mockMvc.perform(get("/api/projects/{id}", testProject.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(testProject.getId().toString()))
                .andExpect(jsonPath("$.data.name").value(testProject.getName()))
                .andExpect(jsonPath("$.data.description").value(testProject.getDescription()))
                .andExpect(jsonPath("$.data.tables").isArray())
                .andExpect(jsonPath("$.message").value("프로젝트를 성공적으로 조회했습니다."));
    }

    @Test
    @DisplayName("존재하지 않는 프로젝트 조회 시 404 오류")
    void getProject_NotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        
        mockMvc.perform(get("/api/projects/{id}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("프로젝트 생성 성공")
    void createProject_Success() throws Exception {
        NamingRulesRequest namingRules = new NamingRulesRequest();
        namingRules.setTablePrefix("tbl_");
        namingRules.setEnforceCase("PASCAL");
        
        CreateProjectRequest request = new CreateProjectRequest(
            "새 프로젝트",
            "새로운 프로젝트입니다.",
            namingRules
        );

        mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("새 프로젝트"))
                .andExpect(jsonPath("$.data.description").value("새로운 프로젝트입니다."))
                .andExpect(jsonPath("$.data.namingRules.tablePrefix").value("tbl_"))
                .andExpect(jsonPath("$.data.namingRules.enforceCase").value("PASCAL"))
                .andExpect(jsonPath("$.message").value("프로젝트가 성공적으로 생성되었습니다."));
    }

    @Test
    @DisplayName("프로젝트 생성 시 필수 필드 누락으로 400 오류")
    void createProject_ValidationError() throws Exception {
        CreateProjectRequest request = new CreateProjectRequest();
        // name 필드 누락

        mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("프로젝트 수정 성공")
    void updateProject_Success() throws Exception {
        NamingRulesRequest namingRules = new NamingRulesRequest();
        namingRules.setColumnPattern("^[a-z][a-z0-9_]*$");
        
        UpdateProjectRequest request = new UpdateProjectRequest(
            "수정된 프로젝트",
            "수정된 설명입니다.",
            namingRules
        );

        mockMvc.perform(put("/api/projects/{id}", testProject.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("수정된 프로젝트"))
                .andExpect(jsonPath("$.data.description").value("수정된 설명입니다."))
                .andExpect(jsonPath("$.data.namingRules.columnPattern").value("^[a-z][a-z0-9_]*$"))
                .andExpect(jsonPath("$.message").value("프로젝트가 성공적으로 수정되었습니다."));
    }

    @Test
    @DisplayName("존재하지 않는 프로젝트 수정 시 404 오류")
    void updateProject_NotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        UpdateProjectRequest request = new UpdateProjectRequest(
            "수정된 프로젝트",
            "수정된 설명입니다.",
            null
        );

        mockMvc.perform(put("/api/projects/{id}", nonExistentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("프로젝트 삭제 성공")
    void deleteProject_Success() throws Exception {
        mockMvc.perform(delete("/api/projects/{id}", testProject.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("존재하지 않는 프로젝트 삭제 시 404 오류")
    void deleteProject_NotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();

        mockMvc.perform(delete("/api/projects/{id}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("잘못된 UUID 형식으로 400 오류")
    void invalidUuidFormat_BadRequest() throws Exception {
        mockMvc.perform(get("/api/projects/{id}", "invalid-uuid"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }
}