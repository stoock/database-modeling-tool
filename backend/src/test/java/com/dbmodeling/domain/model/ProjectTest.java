package com.dbmodeling.domain.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * 프로젝트 도메인 모델 테스트
 */
class ProjectTest {

    @Test
    void 프로젝트_생성_테스트() {
        // Given
        String name = "테스트 프로젝트";
        String description = "테스트용 프로젝트입니다";

        // When
        Project project = new Project(name, description);

        // Then
        assertNotNull(project.getId());
        assertEquals(name, project.getName());
        assertEquals(description, project.getDescription());
        assertNotNull(project.getCreatedAt());
        assertNotNull(project.getUpdatedAt());
        assertNotNull(project.getTables());
        assertTrue(project.getTables().isEmpty());
        assertNotNull(project.getNamingRules());
    }

    @Test
    void 프로젝트_정보_수정_테스트() {
        // Given
        Project project = new Project("원래 이름", "원래 설명");
        String newName = "새로운 이름";
        String newDescription = "새로운 설명";

        // When
        project.updateProject(newName, newDescription);

        // Then
        assertEquals(newName, project.getName());
        assertEquals(newDescription, project.getDescription());
    }

    @Test
    void 테이블_추가_테스트() {
        // Given
        Project project = new Project("프로젝트", "설명");
        Table table = new Table("사용자", "사용자 테이블");

        // When
        project.addTable(table);

        // Then
        assertEquals(1, project.getTables().size());
        assertEquals(project.getId(), table.getProjectId());
        assertTrue(project.getTables().contains(table));
    }

    @Test
    void 테이블_제거_테스트() {
        // Given
        Project project = new Project("프로젝트", "설명");
        Table table = new Table("사용자", "사용자 테이블");
        project.addTable(table);

        // When
        project.removeTable(table.getId());

        // Then
        assertEquals(0, project.getTables().size());
        assertFalse(project.getTables().contains(table));
    }
}