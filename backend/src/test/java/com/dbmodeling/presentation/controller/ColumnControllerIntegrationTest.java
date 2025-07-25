package com.dbmodeling.presentation.controller;

import com.dbmodeling.domain.model.Column;
import com.dbmodeling.domain.model.Project;
import com.dbmodeling.domain.model.Table;
import com.dbmodeling.domain.repository.ColumnRepository;
import com.dbmodeling.domain.repository.ProjectRepository;
import com.dbmodeling.domain.repository.TableRepository;
import com.dbmodeling.presentation.dto.request.CreateColumnRequest;
import com.dbmodeling.presentation.dto.request.UpdateColumnRequest;
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
 * ColumnController 통합 테스트
 */
@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class ColumnControllerIntegrationTest {

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
    private Column testColumn;

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
        testTable = tableRepository.save(testTable);

        // 테스트용 컬럼 생성
        testColumn = new Column();
        testColumn.setTableId(testTable.getId());
        testColumn.setName("test_column");
        testColumn.setDataType("NVARCHAR");
        testColumn.setLength(50);
        testColumn.setNullable(false);
        testColumn.setPrimaryKey(false);
        testColumn.setOrderIndex(1);
        testColumn = columnRepository.save(testColumn);
    }

    @Test
    @DisplayName("테이블의 컬럼 목록 조회 성공")
    void getColumnsByTable_Success() throws Exception {
        mockMvc.perform(get("/api/tables/{tableId}/columns", testTable.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[0].id").exists())
                .andExpect(jsonPath("$.data[0].name").exists())
                .andExpect(jsonPath("$.message").value("컬럼 목록을 성공적으로 조회했습니다."));
    }

    @Test
    @DisplayName("컬럼 상세 조회 성공")
    void getColumn_Success() throws Exception {
        mockMvc.perform(get("/api/columns/{id}", testColumn.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(testColumn.getId().toString()))
                .andExpect(jsonPath("$.data.name").value(testColumn.getName()))
                .andExpect(jsonPath("$.data.dataType").value(testColumn.getDataType()))
                .andExpect(jsonPath("$.data.length").value(testColumn.getLength()))
                .andExpect(jsonPath("$.data.nullable").value(testColumn.isNullable()))
                .andExpect(jsonPath("$.data.primaryKey").value(testColumn.isPrimaryKey()))
                .andExpect(jsonPath("$.message").value("컬럼을 성공적으로 조회했습니다."));
    }

    @Test
    @DisplayName("존재하지 않는 컬럼 조회 시 404 오류")
    void getColumn_NotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        
        mockMvc.perform(get("/api/columns/{id}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("컬럼 생성 성공")
    void createColumn_Success() throws Exception {
        CreateColumnRequest request = new CreateColumnRequest();
        request.setName("new_column");
        request.setDataType("BIGINT");
        request.setNullable(true);
        request.setPrimaryKey(false);
        request.setDescription("새로운 컬럼입니다.");

        mockMvc.perform(post("/api/tables/{tableId}/columns", testTable.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("new_column"))
                .andExpect(jsonPath("$.data.dataType").value("BIGINT"))
                .andExpect(jsonPath("$.data.nullable").value(true))
                .andExpect(jsonPath("$.data.primaryKey").value(false))
                .andExpect(jsonPath("$.message").value("컬럼이 성공적으로 생성되었습니다."));
    }

    @Test
    @DisplayName("컬럼 생성 시 필수 필드 누락으로 400 오류")
    void createColumn_ValidationError() throws Exception {
        CreateColumnRequest request = new CreateColumnRequest();
        // name 필드 누락

        mockMvc.perform(post("/api/tables/{tableId}/columns", testTable.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("컬럼 수정 성공")
    void updateColumn_Success() throws Exception {
        UpdateColumnRequest request = new UpdateColumnRequest();
        request.setName("updated_column");
        request.setDataType("DECIMAL");
        request.setPrecision(18);
        request.setScale(2);
        request.setNullable(true);
        request.setDescription("수정된 컬럼입니다.");

        mockMvc.perform(put("/api/columns/{id}", testColumn.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("updated_column"))
                .andExpect(jsonPath("$.data.dataType").value("DECIMAL"))
                .andExpect(jsonPath("$.data.precision").value(18))
                .andExpect(jsonPath("$.data.scale").value(2))
                .andExpect(jsonPath("$.data.nullable").value(true))
                .andExpect(jsonPath("$.message").value("컬럼이 성공적으로 수정되었습니다."));
    }

    @Test
    @DisplayName("존재하지 않는 컬럼 수정 시 404 오류")
    void updateColumn_NotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        UpdateColumnRequest request = new UpdateColumnRequest();
        request.setName("updated_column");

        mockMvc.perform(put("/api/columns/{id}", nonExistentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("컬럼 삭제 성공")
    void deleteColumn_Success() throws Exception {
        mockMvc.perform(delete("/api/columns/{id}", testColumn.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("존재하지 않는 컬럼 삭제 시 404 오류")
    void deleteColumn_NotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();

        mockMvc.perform(delete("/api/columns/{id}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("컬럼 순서 변경 성공")
    void updateColumnOrder_Success() throws Exception {
        mockMvc.perform(patch("/api/columns/{id}/order", testColumn.getId())
                .param("newOrder", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.orderIndex").value(5))
                .andExpect(jsonPath("$.message").value("컬럼 순서가 성공적으로 변경되었습니다."));
    }

    @Test
    @DisplayName("존재하지 않는 테이블의 컬럼 목록 조회 시 404 오류")
    void getColumnsByTable_TableNotFound() throws Exception {
        UUID nonExistentTableId = UUID.randomUUID();

        mockMvc.perform(get("/api/tables/{tableId}/columns", nonExistentTableId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }
}