package com.dbmodeling.domain.service;

import com.dbmodeling.domain.model.*;
import com.dbmodeling.infrastructure.external.mssql.MSSQLTypeMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * MSSQL SQL 스크립트 생성을 위한 도메인 서비스
 * 프로젝트의 테이블, 컬럼, 인덱스 정보를 기반으로 MSSQL DDL 스크립트를 생성
 */
@Service
public class SqlGeneratorService {
    
    private final MSSQLTypeMapper typeMapper;
    
    public SqlGeneratorService(MSSQLTypeMapper typeMapper) {
        this.typeMapper = typeMapper;
    }

    /**
     * 프로젝트 전체의 SQL 스크립트 생성 (기본 옵션)
     */
    public String generateProjectSql(Project project) {
        return generateProjectSql(project, SchemaGenerationOptions.defaultOptions());
    }

    /**
     * 프로젝트 전체의 SQL 스크립트 생성 (옵션 지정)
     */
    public String generateProjectSql(Project project, SchemaGenerationOptions options) {
        StringBuilder sql = new StringBuilder();
        
        // 배치 스크립트 헤더
        if (options.isGenerateBatchScript()) {
            sql.append("SET NOCOUNT ON;\n");
            sql.append("SET XACT_ABORT ON;\n");
            sql.append("BEGIN TRANSACTION;\n\n");
        }

        // 헤더 주석 추가
        if (options.isIncludeComments()) {
            sql.append("-- ").append(project.getName()).append(" 데이터베이스 스키마\n");
            sql.append("-- 생성일: ").append(java.time.LocalDateTime.now().toString()).append("\n");
            if (project.getDescription() != null && !project.getDescription().trim().isEmpty()) {
                sql.append("-- 설명: ").append(project.getDescription()).append("\n");
            }
            sql.append("\n");
        }

        // 스키마 생성 (지정된 경우)
        if (options.getSchemaName() != null && !options.getSchemaName().trim().isEmpty()) {
            sql.append("-- 스키마 생성\n");
            sql.append("IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = '").append(options.getSchemaName()).append("')\n");
            sql.append("BEGIN\n");
            sql.append("    EXEC('CREATE SCHEMA [").append(options.getSchemaName()).append("]');\n");
            sql.append("END\n\n");
        }

        // DROP 문 생성 (요청된 경우)
        if (options.isIncludeDropStatements()) {
            if (options.isIncludeComments()) {
                sql.append("-- 기존 테이블 삭제\n");
            }
            for (Table table : project.getTables()) {
                sql.append(generateDropTableSql(table));
                sql.append("\n");
            }
        }

        // 모든 테이블의 CREATE TABLE 문 생성
        for (Table table : project.getTables()) {
            if (options.isIncludeExistenceChecks()) {
                sql.append(generateExistenceCheckSql(table));
            } else {
                sql.append(generateCreateTableSql(table));
            }
            sql.append("\n");
        }

        // 제약조건 생성 (요청된 경우)
        if (options.isIncludeConstraints()) {
            for (Table table : project.getTables()) {
                String constraintSql = generateConstraintsSql(table);
                if (!constraintSql.trim().isEmpty()) {
                    if (options.isIncludeComments()) {
                        sql.append("-- ").append(table.getName()).append(" 테이블 제약조건\n");
                    }
                    sql.append(constraintSql);
                    sql.append("\n");
                }
            }
        }

        // 모든 인덱스 생성문 생성 (요청된 경우)
        if (options.isIncludeIndexes()) {
            for (Table table : project.getTables()) {
                String indexSql = generateIndexesSql(table);
                if (!indexSql.trim().isEmpty()) {
                    sql.append(indexSql);
                    sql.append("\n");
                }
            }
        }

        // 배치 스크립트 푸터
        if (options.isGenerateBatchScript()) {
            sql.append("COMMIT TRANSACTION;\n");
            sql.append("PRINT 'Schema creation completed successfully.';\n");
        }

        return sql.toString();
    }

    /**
     * 단일 테이블의 CREATE TABLE 문 생성
     */
    public String generateCreateTableSql(Table table) {
        StringBuilder sql = new StringBuilder();
        
        // 테이블 주석
        sql.append("-- 테이블: ").append(table.getName());
        if (table.getDescription() != null && !table.getDescription().trim().isEmpty()) {
            sql.append(" - ").append(table.getDescription());
        }
        sql.append("\n");
        
        sql.append("CREATE TABLE [").append(table.getName()).append("] (\n");
        
        // 컬럼 정의
        List<String> columnDefinitions = table.getColumns().stream()
                .sorted((c1, c2) -> Integer.compare(c1.getOrderIndex(), c2.getOrderIndex()))
                .map(this::generateColumnDefinition)
                .collect(Collectors.toList());
        
        sql.append(String.join(",\n", columnDefinitions));
        
        // 기본키 제약조건 추가
        List<Column> primaryKeyColumns = table.getPrimaryKeyColumns();
        if (!primaryKeyColumns.isEmpty()) {
            sql.append(",\n");
            sql.append(generatePrimaryKeyConstraint(table.getName(), primaryKeyColumns));
        }
        
        sql.append("\n);\n");
        
        return sql.toString();
    }

    /**
     * 컬럼 정의 생성
     */
    private String generateColumnDefinition(Column column) {
        StringBuilder definition = new StringBuilder();
        
        // 들여쓰기
        definition.append("    ");
        
        // 컬럼명
        definition.append("[").append(column.getName()).append("] ");
        
        // 데이터 타입
        definition.append(typeMapper.mapToSqlType(column));
        
        // IDENTITY 설정
        if (column.isIdentity()) {
            definition.append(" IDENTITY(")
                    .append(column.getIdentitySeed() != null ? column.getIdentitySeed() : 1)
                    .append(",")
                    .append(column.getIdentityIncrement() != null ? column.getIdentityIncrement() : 1)
                    .append(")");
        }
        
        // NULL 허용 여부
        if (column.isNullable()) {
            definition.append(" NULL");
        } else {
            definition.append(" NOT NULL");
        }
        
        // 기본값
        if (column.getDefaultValue() != null && !column.getDefaultValue().trim().isEmpty()) {
            definition.append(" DEFAULT ").append(column.getDefaultValue());
        }
        
        // 컬럼 주석 (인라인 주석으로 추가)
        if (column.getDescription() != null && !column.getDescription().trim().isEmpty()) {
            definition.append(" -- ").append(column.getDescription());
        }
        
        return definition.toString();
    }

    /**
     * 기본키 제약조건 생성
     */
    private String generatePrimaryKeyConstraint(String tableName, List<Column> primaryKeyColumns) {
        StringBuilder constraint = new StringBuilder();
        
        constraint.append("    CONSTRAINT [PK_").append(tableName).append("] PRIMARY KEY");
        
        // 클러스터드 인덱스 여부 확인 (기본적으로 클러스터드)
        constraint.append(" CLUSTERED");
        
        constraint.append(" (");
        
        String columnList = primaryKeyColumns.stream()
                .sorted((c1, c2) -> Integer.compare(c1.getOrderIndex(), c2.getOrderIndex()))
                .map(column -> "[" + column.getName() + "] ASC")
                .collect(Collectors.joining(", "));
        
        constraint.append(columnList);
        constraint.append(")");
        
        return constraint.toString();
    }

    /**
     * 테이블의 모든 인덱스 생성문 생성
     */
    public String generateIndexesSql(Table table) {
        StringBuilder sql = new StringBuilder();
        
        for (Index index : table.getIndexes()) {
            sql.append(generateCreateIndexSql(table, index));
            sql.append("\n");
        }
        
        return sql.toString();
    }

    /**
     * 단일 인덱스 생성문 생성
     */
    public String generateCreateIndexSql(Table table, Index index) {
        StringBuilder sql = new StringBuilder();
        
        // 인덱스 주석
        sql.append("-- 인덱스: ").append(index.getName());
        if (index.isUnique()) {
            sql.append(" (유니크)");
        }
        sql.append("\n");
        
        sql.append("CREATE ");
        
        // 유니크 인덱스
        if (index.isUnique()) {
            sql.append("UNIQUE ");
        }
        
        // 클러스터드/논클러스터드
        sql.append(index.getType().getSqlName()).append(" ");
        
        sql.append("INDEX [").append(index.getName()).append("] ");
        sql.append("ON [").append(table.getName()).append("] (");
        
        // 인덱스 컬럼 목록
        String columnList = index.getColumns().stream()
                .map(indexColumn -> {
                    // 실제 구현에서는 columnId로 컬럼을 찾아야 함
                    // 여기서는 간단히 처리
                    Column column = findColumnById(table, indexColumn.getColumnId());
                    if (column != null) {
                        return "[" + column.getName() + "] " + indexColumn.getOrder().getSqlName();
                    }
                    return "-- 컬럼을 찾을 수 없음: " + indexColumn.getColumnId();
                })
                .collect(Collectors.joining(", "));
        
        sql.append(columnList);
        sql.append(");\n");
        
        return sql.toString();
    }

    /**
     * 테이블에서 컬럼 ID로 컬럼 찾기
     */
    private Column findColumnById(Table table, java.util.UUID columnId) {
        return table.getColumns().stream()
                .filter(column -> column.getId().equals(columnId))
                .findFirst()
                .orElse(null);
    }

    /**
     * 제약조건 생성문 생성
     */
    public String generateConstraintsSql(Table table) {
        StringBuilder sql = new StringBuilder();
        
        // CHECK 제약조건 생성
        for (Column column : table.getColumns()) {
            String checkConstraint = generateCheckConstraint(table.getName(), column);
            if (!checkConstraint.isEmpty()) {
                sql.append(checkConstraint).append("\n");
            }
        }
        
        // 유니크 제약조건 생성 (유니크 인덱스가 아닌 제약조건으로)
        for (Index index : table.getIndexes()) {
            if (index.isUnique() && !index.getColumns().isEmpty()) {
                sql.append(generateUniqueConstraint(table.getName(), index)).append("\n");
            }
        }
        
        return sql.toString();
    }

    /**
     * CHECK 제약조건 생성
     */
    private String generateCheckConstraint(String tableName, Column column) {
        StringBuilder constraint = new StringBuilder();
        
        // 데이터 타입별 기본 CHECK 제약조건
        if (column.getDataType() != null) {
            switch (column.getDataType()) {
                case BIT -> {
                    // BIT 타입은 0 또는 1만 허용
                    constraint.append("ALTER TABLE [").append(tableName).append("] ")
                             .append("ADD CONSTRAINT [CK_").append(tableName).append("_").append(column.getName()).append("] ")
                             .append("CHECK ([").append(column.getName()).append("] IN (0, 1));");
                }
                case TINYINT -> {
                    // TINYINT는 0-255 범위
                    constraint.append("ALTER TABLE [").append(tableName).append("] ")
                             .append("ADD CONSTRAINT [CK_").append(tableName).append("_").append(column.getName()).append("] ")
                             .append("CHECK ([").append(column.getName()).append("] >= 0 AND [").append(column.getName()).append("] <= 255);");
                }
                case SMALLINT -> {
                    // SMALLINT는 -32768 ~ 32767 범위
                    constraint.append("ALTER TABLE [").append(tableName).append("] ")
                             .append("ADD CONSTRAINT [CK_").append(tableName).append("_").append(column.getName()).append("] ")
                             .append("CHECK ([").append(column.getName()).append("] >= -32768 AND [").append(column.getName()).append("] <= 32767);");
                }
            }
        }
        
        return constraint.toString();
    }

    /**
     * 유니크 제약조건 생성 (인덱스와 별도)
     */
    private String generateUniqueConstraint(String tableName, Index index) {
        StringBuilder constraint = new StringBuilder();
        
        constraint.append("ALTER TABLE [").append(tableName).append("] ")
                 .append("ADD CONSTRAINT [UQ_").append(tableName).append("_").append(index.getName().replace("IX_", "")).append("] ")
                 .append("UNIQUE (");
        
        String columnList = index.getColumns().stream()
                .map(indexColumn -> {
                    // 실제 구현에서는 columnId로 컬럼을 찾아야 함
                    return "[column_name]"; // 임시 처리
                })
                .collect(Collectors.joining(", "));
        
        constraint.append(columnList).append(");");
        
        return constraint.toString();
    }

    /**
     * DROP 문 생성 (테이블 삭제용)
     */
    public String generateDropTableSql(Table table) {
        StringBuilder sql = new StringBuilder();
        
        // 인덱스 먼저 삭제
        for (Index index : table.getIndexes()) {
            sql.append("DROP INDEX [").append(index.getName()).append("] ON [").append(table.getName()).append("];\n");
        }
        
        // 테이블 삭제
        sql.append("DROP TABLE [").append(table.getName()).append("];\n");
        
        return sql.toString();
    }

    /**
     * 스키마 존재 여부 확인 스크립트 생성
     */
    public String generateExistenceCheckSql(Table table) {
        StringBuilder sql = new StringBuilder();
        
        sql.append("IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[")
           .append(table.getName())
           .append("]') AND type in (N'U'))\n");
        sql.append("BEGIN\n");
        sql.append(generateCreateTableSql(table).replaceAll("(?m)^", "    "));
        sql.append("END\n");
        
        return sql.toString();
    }

    /**
     * 테이블 변경 스크립트 생성 (ALTER TABLE)
     */
    public String generateAlterTableSql(Table originalTable, Table modifiedTable) {
        StringBuilder sql = new StringBuilder();
        
        // 테이블명 변경
        if (!originalTable.getName().equals(modifiedTable.getName())) {
            sql.append("EXEC sp_rename '[").append(originalTable.getName()).append("]', '[")
               .append(modifiedTable.getName()).append("]';\n");
        }
        
        // 컬럼 변경사항 처리
        sql.append(generateColumnAlterations(originalTable, modifiedTable));
        
        // 인덱스 변경사항 처리
        sql.append(generateIndexAlterations(originalTable, modifiedTable));
        
        return sql.toString();
    }

    /**
     * 컬럼 변경사항 생성
     */
    private String generateColumnAlterations(Table originalTable, Table modifiedTable) {
        StringBuilder sql = new StringBuilder();
        
        // 새로 추가된 컬럼
        for (Column newColumn : modifiedTable.getColumns()) {
            boolean exists = originalTable.getColumns().stream()
                    .anyMatch(col -> col.getId().equals(newColumn.getId()));
            if (!exists) {
                sql.append("ALTER TABLE [").append(modifiedTable.getName()).append("] ")
                   .append("ADD ").append(generateColumnDefinition(newColumn).trim()).append(";\n");
            }
        }
        
        // 삭제된 컬럼
        for (Column originalColumn : originalTable.getColumns()) {
            boolean exists = modifiedTable.getColumns().stream()
                    .anyMatch(col -> col.getId().equals(originalColumn.getId()));
            if (!exists) {
                sql.append("ALTER TABLE [").append(modifiedTable.getName()).append("] ")
                   .append("DROP COLUMN [").append(originalColumn.getName()).append("];\n");
            }
        }
        
        // 수정된 컬럼
        for (Column modifiedColumn : modifiedTable.getColumns()) {
            Column originalColumn = originalTable.getColumns().stream()
                    .filter(col -> col.getId().equals(modifiedColumn.getId()))
                    .findFirst()
                    .orElse(null);
            
            if (originalColumn != null && !columnsEqual(originalColumn, modifiedColumn)) {
                sql.append("ALTER TABLE [").append(modifiedTable.getName()).append("] ")
                   .append("ALTER COLUMN ").append(generateColumnDefinition(modifiedColumn).trim()).append(";\n");
            }
        }
        
        return sql.toString();
    }

    /**
     * 인덱스 변경사항 생성
     */
    private String generateIndexAlterations(Table originalTable, Table modifiedTable) {
        StringBuilder sql = new StringBuilder();
        
        // 삭제된 인덱스
        for (Index originalIndex : originalTable.getIndexes()) {
            boolean exists = modifiedTable.getIndexes().stream()
                    .anyMatch(idx -> idx.getId().equals(originalIndex.getId()));
            if (!exists) {
                sql.append("DROP INDEX [").append(originalIndex.getName()).append("] ON [")
                   .append(modifiedTable.getName()).append("];\n");
            }
        }
        
        // 새로 추가된 인덱스
        for (Index newIndex : modifiedTable.getIndexes()) {
            boolean exists = originalTable.getIndexes().stream()
                    .anyMatch(idx -> idx.getId().equals(newIndex.getId()));
            if (!exists) {
                sql.append(generateCreateIndexSql(modifiedTable, newIndex));
            }
        }
        
        return sql.toString();
    }

    /**
     * 컬럼 동등성 비교
     */
    private boolean columnsEqual(Column col1, Column col2) {
        return col1.getName().equals(col2.getName()) &&
               col1.getDataType() == col2.getDataType() &&
               java.util.Objects.equals(col1.getMaxLength(), col2.getMaxLength()) &&
               java.util.Objects.equals(col1.getPrecision(), col2.getPrecision()) &&
               java.util.Objects.equals(col1.getScale(), col2.getScale()) &&
               col1.isNullable().equals(col2.isNullable()) &&
               java.util.Objects.equals(col1.getDefaultValue(), col2.getDefaultValue());
    }

    /**
     * 데이터베이스 백업 스크립트 생성
     */
    public String generateBackupScript(String databaseName, String backupPath) {
        StringBuilder sql = new StringBuilder();
        
        sql.append("-- 데이터베이스 백업 스크립트\n");
        sql.append("BACKUP DATABASE [").append(databaseName).append("]\n");
        sql.append("TO DISK = '").append(backupPath).append("'\n");
        sql.append("WITH FORMAT, INIT, NAME = '").append(databaseName).append(" Full Backup',\n");
        sql.append("SKIP, NOREWIND, NOUNLOAD, STATS = 10;\n");
        
        return sql.toString();
    }

    /**
     * 성능 모니터링을 위한 통계 업데이트 스크립트 생성
     */
    public String generateStatisticsUpdateScript(Project project) {
        StringBuilder sql = new StringBuilder();
        
        sql.append("-- 통계 정보 업데이트 스크립트\n");
        for (Table table : project.getTables()) {
            sql.append("UPDATE STATISTICS [").append(table.getName()).append("] WITH FULLSCAN;\n");
        }
        
        return sql.toString();
    }
}