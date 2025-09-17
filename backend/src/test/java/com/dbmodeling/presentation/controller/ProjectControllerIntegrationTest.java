package com.dbmodeling.presentation.controller;

import com.dbmodeling.DatabaseModelingToolApplication;
import com.dbmodeling.domain.model.NamingRules;
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
@SpringBootTest(classes = DatabaseModelingToolApplication.class)
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
        testProject = new Project();
        testProject.setName("테스트 프로젝트");
        testProject.setDescription("통합 테스트용 프로젝트");
        
        NamingRules namingRules = new NamingRules();
        namingRules.setTablePattern("^[A-Z][a-zA-Z0-9]*$");
        namingRules.setColumnPattern("^[a-z][a-z0-9_]*$");
        namingRules.setIndexPattern("^IX_[A-Z][a-zA-Z0-9]*_[a-zA-Z0-9]+$");
        namingRules.setEnforceCase(NamingRules.CaseType.PASCAL);
        testProject.setNamingRules(namingRules);
        
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
                .andExpect(jsonPath("$.data[0].name").value("테스트 프로젝트"))
                .andExpect(jsonPath("$.message").value("프로젝트 목록을 성공적으로 조회했습니다."));
    }

    @Test
    @DisplayName("프로젝트 상세 조회 성공")
    void getProject_Success() throws Exception {
        mockMvc.perform(get("/api/projects/{id}", testProject.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(testProject.getId().toString()))
                .andExpect(jsonPath("$.data.name").value("테스트 프로젝트"))
                .andExpect(jsonPath("$.data.description").value("통합 테스트용 프로젝트"))
                .andExpect(jsonPath("$.data.namingRules.tablePattern").value("^[A-Z][a-zA-Z0-9]*$"))
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
        NamingRulesRequest namingRulesRequest = new NamingRulesRequest();
        namingRulesRequest.setTablePattern("^[A-Z][a-zA-Z0-9]*$");
        namingRulesRequest.setColumnPattern("^[a-z][a-z0-9_]*$");
        namingRulesRequest.setIndexPattern("^IX_[A-Z][a-zA-Z0-9]*_[a-zA-Z0-9]+$");
        namingRulesRequest.setEnforceCase("PASCAL");

        CreateProjectRequest request = new CreateProjectRequest();
        request.setName("새 프로젝트");
        request.setDescription("새로 생성된 프로젝트");
        request.setNamingRules(namingRulesRequest);

        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("새 프로젝트"))
                .andExpect(jsonPath("$.data.description").value("새로 생성된 프로젝트"))
                .andExpect(jsonPath("$.data.namingRules.tablePattern").value("^[A-Z][a-zA-Z0-9]*$"))
                .andExpect(jsonPath("$.message").value("프로젝트가 성공적으로 생성되었습니다."));
    }

    @Test
    @DisplayName("잘못된 데이터로 프로젝트 생성 시 400 오류")
    void createProject_InvalidData() throws Exception {
        CreateProjectRequest request = new CreateProjectRequest();
        // name 필드를 비워둠 (필수 필드)

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
        NamingRulesRequest namingRulesRequest = new NamingRulesRequest();
        namingRulesRequest.setTablePattern("^[A-Z][a-zA-Z0-9]*$");
        namingRulesRequest.setColumnPattern("^[a-z][a-z0-9_]*$");
        namingRulesRequest.setIndexPattern("^IX_[A-Z][a-zA-Z0-9]*_[a-zA-Z0-9]+$");
        namingRulesRequest.setEnforceCase("SNAKE");

        UpdateProjectRequest request = new UpdateProjectRequest();
        request.setName("수정된 프로젝트");
        request.setDescription("수정된 설명");
        request.setNamingRules(namingRulesRequest);

        mockMvc.perform(put("/api/projects/{id}", testProject.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("수정된 프로젝트"))
                .andExpect(jsonPath("$.data.description").value("수정된 설명"))
                .andExpect(jsonPath("$.data.namingRules.enforceCase").value("SNAKE"))
                .andExpect(jsonPath("$.message").value("프로젝트가 성공적으로 수정되었습니다."));
    }

    @Test
    @DisplayName("존재하지 않는 프로젝트 수정 시 404 오류")
    void updateProject_NotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        
        UpdateProjectRequest request = new UpdateProjectRequest();
        request.setName("수정된 프로젝트");

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

        // 삭제 확인
        mockMvc.perform(get("/api/projects/{id}", testProject.getId()))
                .andExpect(status().isNotFound());
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
    @DisplayName("잘못된 UUID 형식으로 프로젝트 조회 시 404 오류")
    void getProject_InvalidUUID() throws Exception {
        mockMvc.perform(get("/api/projects/{id}", "invalid-uuid"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }
}