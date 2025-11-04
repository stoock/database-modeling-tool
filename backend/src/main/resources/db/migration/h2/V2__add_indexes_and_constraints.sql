-- Database Modeling Tool 인덱스 및 제약조건 추가 (H2 호환)
-- 버전: 2.0.0
-- 성능 최적화를 위한 인덱스

-- 프로젝트 테이블 인덱스
CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_projects_created_at ON projects(created_at);

-- 테이블 인덱스
CREATE INDEX idx_tables_project_id ON tables(project_id);
CREATE INDEX idx_tables_name ON tables(name);
CREATE INDEX idx_tables_position ON tables(position_x, position_y);
CREATE INDEX idx_tables_project_name ON tables(project_id, name);

-- 컬럼 인덱스
CREATE INDEX idx_columns_table_id ON columns(table_id);
CREATE INDEX idx_columns_order_index ON columns(table_id, order_index);
CREATE INDEX idx_columns_data_type ON columns(data_type);
CREATE INDEX idx_columns_name ON columns(name);
CREATE INDEX idx_columns_table_order ON columns(table_id, order_index);

-- 인덱스 테이블 인덱스
CREATE INDEX idx_indexes_table_id ON indexes(table_id);
CREATE INDEX idx_indexes_name ON indexes(name);
CREATE INDEX idx_indexes_type ON indexes(type);
CREATE INDEX idx_indexes_table_type ON indexes(table_id, type);

-- 감사 로그 테이블 (변경 이력 추적용)
CREATE TABLE audit_logs (
    id UUID NOT NULL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_values VARCHAR(10000),
    new_values VARCHAR(10000),
    user_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT audit_logs_entity_type_valid CHECK (entity_type IN ('PROJECT', 'TABLE', 'COLUMN', 'INDEX')),
    CONSTRAINT audit_logs_action_valid CHECK (action IN ('CREATE', 'UPDATE', 'DELETE'))
);

-- 감사 로그 인덱스
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
