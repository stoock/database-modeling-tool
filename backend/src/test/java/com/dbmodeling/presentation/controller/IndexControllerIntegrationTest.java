package com.dbmodeling.presentation.controller;

import com.dbmodeling.domain.model.*;
import com.dbmodeling.domain.repository.*;
import static org.hamcrest.Matchers.containsString;
import com.dbmodeling.presentation.dto.request.CreateIndexRequest;
import com.dbmodeling.presentation.dto.request.UpdateIndexRequest;
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

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * IndexController 통합 테스트
 */
@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class IndexControllerIntegrationTest {

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

    @Autowired
    private IndexRepository indexRepository;

    private Project testProject;
    private Table testTable;
    private Column testColumn;
    private Index testIndex;

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
        testColumn.setDataType(MSSQLDataType.NVARCHAR);
        testColumn.setMaxLength(50);
        testColumn.setNullable(false);
        testColumn = columnRepository.save(testColumn);

        // 테스트용 인덱스 생성
        testIndex = new Index();
        testIndex.setTableId(testTable.getId());
        testIndex.setName("IX_TestTable_test_column");
        testIndex.setType(Index.IndexType.NONCLUSTERED);
        testIndex.setUnique(false);
        
        Index.IndexColumn indexColumn = new Index.IndexColumn();
        indexColumn.setColumnId(testColumn.getId());
        indexColumn.setColumnName(testColumn.getName());
        indexColumn.setOrder(Index.SortOrder.ASC);
        testIndex.setColumns(List.of(indexColumn));
        
        testIndex = indexRepository.save(testIndex);
    }

    @Test
    @DisplayName("테이블의 인덱스 목록 조회 성공")
    void getIndexesByTable_Success() throws Exception {
        mockMvc.perform(get("/api/tables/{tableId}/indexes", testTable.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[0].id").exists())
                .andExpect(jsonPath("$.data[0].name").exists())
                .andExpect(jsonPath("$.message").value("인덱스 목록을 성공적으로 조회했습니다."));
    }

    @Test
    @DisplayName("인덱스 상세 조회 성공")
    void getIndex_Success() throws Exception {
        mockMvc.perform(get("/api/indexes/{id}", testIndex.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(testIndex.getId().toString()))
                .andExpect(jsonPath("$.data.name").value(testIndex.getName()))
                .andExpect(jsonPath("$.data.type").value(testIndex.getType().name()))
                .andExpect(jsonPath("$.data.unique").value(testIndex.isUnique()))
                .andExpect(jsonPath("$.data.columns").isArray())
                .andExpect(jsonPath("$.message").value("인덱스를 성공적으로 조회했습니다."));
    }

    @Test
    @DisplayName("존재하지 않는 인덱스 조회 시 404 오류")
    void getIndex_NotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        
        mockMvc.perform(get("/api/indexes/{id}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("인덱스 생성 성공")
    void createIndex_Success() throws Exception {
        CreateIndexRequest.IndexColumnRequest columnRequest = new CreateIndexRequest.IndexColumnRequest();
        columnRequest.setColumnId(testColumn.getId().toString());
        columnRequest.setOrder("ASC");

        CreateIndexRequest request = new CreateIndexRequest();
        request.setName("IX_TestTable_new_index");
        request.setType("NONCLUSTERED");
        request.setIsUnique(true);
        request.setColumns(List.of(columnRequest));

        mockMvc.perform(post("/api/tables/{tableId}/indexes", testTable.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("IX_TestTable_new_index"))
                .andExpect(jsonPath("$.data.type").value("NONCLUSTERED"))
                .andExpect(jsonPath("$.data.unique").value(true))
                .andExpect(jsonPath("$.message").value("인덱스가 성공적으로 생성되었습니다."));
    }

    @Test
    @DisplayName("인덱스 생성 시 필수 필드 누락으로 400 오류")
    void createIndex_ValidationError() throws Exception {
        CreateIndexRequest request = new CreateIndexRequest();
        // name 필드 누락

        mockMvc.perform(post("/api/tables/{tableId}/indexes", testTable.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("인덱스 수정 성공")
    void updateIndex_Success() throws Exception {
        CreateIndexRequest.IndexColumnRequest columnRequest = new CreateIndexRequest.IndexColumnRequest();
        columnRequest.setColumnId(testColumn.getId().toString());
        columnRequest.setOrder("DESC");

        UpdateIndexRequest request = new UpdateIndexRequest();
        request.setName("IX_TestTable_updated");
        request.setType("CLUSTERED");
        request.setIsUnique(true);
        request.setColumns(List.of(columnRequest));

        mockMvc.perform(put("/api/indexes/{id}", testIndex.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("IX_TestTable_updated"))
                .andExpect(jsonPath("$.data.type").value("CLUSTERED"))
                .andExpect(jsonPath("$.data.unique").value(true))
                .andExpect(jsonPath("$.message").value("인덱스가 성공적으로 수정되었습니다."));
    }

    @Test
    @DisplayName("존재하지 않는 인덱스 수정 시 404 오류")
    void updateIndex_NotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        UpdateIndexRequest request = new UpdateIndexRequest();
        request.setName("IX_TestTable_updated");

        mockMvc.perform(put("/api/indexes/{id}", nonExistentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("인덱스 삭제 성공")
    void deleteIndex_Success() throws Exception {
        mockMvc.perform(delete("/api/indexes/{id}", testIndex.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("존재하지 않는 인덱스 삭제 시 404 오류")
    void deleteIndex_NotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();

        mockMvc.perform(delete("/api/indexes/{id}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("존재하지 않는 테이블의 인덱스 목록 조회 시 404 오류")
    void getIndexesByTable_TableNotFound() throws Exception {
        UUID nonExistentTableId = UUID.randomUUID();

        mockMvc.perform(get("/api/tables/{tableId}/indexes", nonExistentTableId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }
}