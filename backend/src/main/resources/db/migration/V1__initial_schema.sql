-- 프로젝트 테이블
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0
);

-- 테이블 정의 테이블
CREATE TABLE db_tables (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    position_x INTEGER NOT NULL DEFAULT 0,
    position_y INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_tables_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 컬럼 정의 테이블
CREATE TABLE db_columns (
    id BIGSERIAL PRIMARY KEY,
    table_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    length INTEGER,
    precision INTEGER,
    scale INTEGER,
    is_nullable BOOLEAN NOT NULL DEFAULT true,
    is_primary_key BOOLEAN NOT NULL DEFAULT false,
    is_unique BOOLEAN NOT NULL DEFAULT false,
    is_foreign_key BOOLEAN NOT NULL DEFAULT false,
    is_auto_increment BOOLEAN NOT NULL DEFAULT false,
    default_value TEXT,
    check_constraint TEXT,
    description TEXT,
    ordinal_position INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_columns_table FOREIGN KEY (table_id) REFERENCES db_tables(id) ON DELETE CASCADE
);

-- 인덱스 정의 테이블
CREATE TABLE db_indexes (
    id BIGSERIAL PRIMARY KEY,
    table_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_unique BOOLEAN NOT NULL DEFAULT false,
    is_clustered BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_indexes_table FOREIGN KEY (table_id) REFERENCES db_tables(id) ON DELETE CASCADE
);

-- 인덱스 컬럼 매핑 테이블
CREATE TABLE db_index_columns (
    id BIGSERIAL PRIMARY KEY,
    index_id BIGINT NOT NULL,
    column_id BIGINT NOT NULL,
    ordinal_position INTEGER NOT NULL,
    is_descending BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_index_columns_index FOREIGN KEY (index_id) REFERENCES db_indexes(id) ON DELETE CASCADE,
    CONSTRAINT fk_index_columns_column FOREIGN KEY (column_id) REFERENCES db_columns(id) ON DELETE CASCADE
);

-- 외래 키 정의 테이블
CREATE TABLE db_foreign_keys (
    id BIGSERIAL PRIMARY KEY,
    table_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    referenced_table_id BIGINT NOT NULL,
    on_update VARCHAR(20) NOT NULL DEFAULT 'NO ACTION',
    on_delete VARCHAR(20) NOT NULL DEFAULT 'NO ACTION',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_foreign_keys_table FOREIGN KEY (table_id) REFERENCES db_tables(id) ON DELETE CASCADE,
    CONSTRAINT fk_foreign_keys_referenced_table FOREIGN KEY (referenced_table_id) REFERENCES db_tables(id)
);

-- 외래 키 컬럼 매핑 테이블
CREATE TABLE db_foreign_key_columns (
    id BIGSERIAL PRIMARY KEY,
    foreign_key_id BIGINT NOT NULL,
    column_id BIGINT NOT NULL,
    referenced_column_id BIGINT NOT NULL,
    ordinal_position INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_foreign_key_columns_fk FOREIGN KEY (foreign_key_id) REFERENCES db_foreign_keys(id) ON DELETE CASCADE,
    CONSTRAINT fk_foreign_key_columns_column FOREIGN KEY (column_id) REFERENCES db_columns(id) ON DELETE CASCADE,
    CONSTRAINT fk_foreign_key_columns_referenced_column FOREIGN KEY (referenced_column_id) REFERENCES db_columns(id)
);

-- 네이밍 규칙 설정 테이블
CREATE TABLE naming_rules (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    entity_type VARCHAR(20) NOT NULL, -- 'TABLE', 'COLUMN', 'INDEX', 'FOREIGN_KEY'
    pattern VARCHAR(255),
    case_format VARCHAR(20), -- 'PASCAL_CASE', 'CAMEL_CASE', 'SNAKE_CASE'
    prefix VARCHAR(50),
    suffix VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_naming_rules_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT uk_naming_rules_project_entity UNIQUE (project_id, entity_type)
);

-- 테이블 인덱스
CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_db_tables_project_id ON db_tables(project_id);
CREATE INDEX idx_db_tables_name ON db_tables(name);
CREATE INDEX idx_db_columns_table_id ON db_columns(table_id);
CREATE INDEX idx_db_columns_name ON db_columns(name);
CREATE INDEX idx_db_indexes_table_id ON db_indexes(table_id);
CREATE INDEX idx_db_index_columns_index_id ON db_index_columns(index_id);
CREATE INDEX idx_db_foreign_keys_table_id ON db_foreign_keys(table_id);
CREATE INDEX idx_db_foreign_keys_referenced_table_id ON db_foreign_keys(referenced_table_id);
CREATE INDEX idx_naming_rules_project_id ON naming_rules(project_id);

-- 트리거 함수: 업데이트 시간 자동 갱신
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_projects_timestamp
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_db_tables_timestamp
BEFORE UPDATE ON db_tables
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_db_columns_timestamp
BEFORE UPDATE ON db_columns
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_db_indexes_timestamp
BEFORE UPDATE ON db_indexes
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_db_foreign_keys_timestamp
BEFORE UPDATE ON db_foreign_keys
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_naming_rules_timestamp
BEFORE UPDATE ON naming_rules
FOR EACH ROW EXECUTE FUNCTION update_timestamp();