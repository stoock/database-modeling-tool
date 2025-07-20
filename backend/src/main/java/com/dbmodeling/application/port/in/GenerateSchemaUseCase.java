package com.dbmodeling.application.port.in;

import java.util.UUID;

/**
 * 스키마 생성 유스케이스 인터페이스
 */
public interface GenerateSchemaUseCase {
    
    /**
     * MSSQL 스키마 스크립트 생성
     */
    SchemaResult generateSchema(GenerateSchemaCommand command);
    
    /**
     * 스키마 생성 명령
     */
    record GenerateSchemaCommand(
        UUID projectId,
        SchemaFormat format
    ) {
        public GenerateSchemaCommand {
            if (projectId == null) {
                throw new IllegalArgumentException("프로젝트 ID는 필수입니다.");
            }
            if (format == null) {
                throw new IllegalArgumentException("스키마 형식은 필수입니다.");
            }
        }
    }
    
    /**
     * 스키마 생성 결과
     */
    record SchemaResult(
        String sqlScript,
        String documentation,
        boolean hasErrors,
        java.util.List<String> errors
    ) {}
    
    /**
     * 스키마 형식
     */
    enum SchemaFormat {
        SQL_ONLY,
        SQL_WITH_DOCUMENTATION,
        DOCUMENTATION_ONLY
    }
}