-- Database Modeling Tool 초기 스키마 생성 (H2 호환)
-- 버전: 1.0.0
-- MSSQL 데이터베이스 모델링 도구를 위한 H2 스키마

-- 프로젝트 테이블
CREATE TABLE projects (
    id UUID NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(10000),
    naming_rules VARCHAR(10000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    
    CONSTRAINT projects_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT projects_name_unique UNIQUE (name)
);

-- 테이블 정의
CREATE TABLE tables (
    id UUID NOT NULL PRIMARY KEY,
    project_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(10000),
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    
    CONSTRAINT tables_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT tables_position_valid CHECK (position_x >= 0 AND position_y >= 0),
    CONSTRAINT tables_project_fk FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT tables_project_name_unique UNIQUE(project_id, name)
);

-- 컬럼 정의
CREATE TABLE columns (
    id UUID NOT NULL PRIMARY KEY,
    table_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(10000),
    data_type VARCHAR(100) NOT NULL,
    max_length INTEGER,
    precision_value INTEGER,
    scale_value INTEGER,
    is_nullable BOOLEAN DEFAULT TRUE,
    is_primary_key BOOLEAN DEFAULT FALSE,
    is_identity BOOLEAN DEFAULT FALSE,
    identity_seed INTEGER DEFAULT 1,
    identity_increment INTEGER DEFAULT 1,
    default_value VARCHAR(1000),
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT columns_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT columns_data_type_not_empty CHECK (LENGTH(TRIM(data_type)) > 0),
    CONSTRAINT columns_order_index_positive CHECK (order_index >= 0),
    CONSTRAINT columns_length_positive CHECK (max_length IS NULL OR max_length > 0),
    CONSTRAINT columns_precision_positive CHECK (precision_value IS NULL OR precision_value > 0),
    CONSTRAINT columns_scale_valid CHECK (scale_value IS NULL OR (scale_value >= 0 AND scale_value <= precision_value)),
    CONSTRAINT columns_identity_seed_positive CHECK (identity_seed IS NULL OR identity_seed >= 0),
    CONSTRAINT columns_identity_increment_positive CHECK (identity_increment IS NULL OR identity_increment > 0),
    CONSTRAINT columns_table_fk FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE,
    CONSTRAINT columns_table_name_unique UNIQUE(table_id, name),
    CONSTRAINT columns_table_order_unique UNIQUE(table_id, order_index)
);

-- 인덱스 정의
CREATE TABLE indexes (
    id UUID NOT NULL PRIMARY KEY,
    table_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'NONCLUSTERED',
    is_unique BOOLEAN DEFAULT FALSE,
    columns VARCHAR(5000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT indexes_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT indexes_type_valid CHECK (type IN ('CLUSTERED', 'NONCLUSTERED')),
    CONSTRAINT indexes_columns_not_empty CHECK (LENGTH(TRIM(columns)) > 0),
    CONSTRAINT indexes_table_fk FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE,
    CONSTRAINT indexes_table_name_unique UNIQUE(table_id, name)
);
