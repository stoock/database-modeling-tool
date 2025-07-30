-- 테스트 환경용 스키마 초기화 스크립트

-- 기존 테이블 삭제 (역순)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS indexes;
DROP TABLE IF EXISTS columns;
DROP TABLE IF EXISTS tables;
DROP TABLE IF EXISTS projects;

-- 프로젝트 테이블
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    naming_rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT projects_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- 테이블 정의
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT tables_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT tables_position_valid CHECK (position_x >= 0 AND position_y >= 0),
    UNIQUE(project_id, name)
);

-- 컬럼 정의
CREATE TABLE columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    data_type VARCHAR(100) NOT NULL,
    max_length INTEGER,
    precision_value INTEGER,
    scale_value INTEGER,
    is_nullable BOOLEAN DEFAULT TRUE,
    is_primary_key BOOLEAN DEFAULT FALSE,
    is_identity BOOLEAN DEFAULT FALSE,
    identity_seed INTEGER DEFAULT 1,
    identity_increment INTEGER DEFAULT 1,
    default_value TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT columns_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT columns_data_type_not_empty CHECK (LENGTH(TRIM(data_type)) > 0),
    CONSTRAINT columns_order_index_positive CHECK (order_index >= 0),
    UNIQUE(table_id, name),
    UNIQUE(table_id, order_index)
);

-- 인덱스 정의
CREATE TABLE indexes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'NONCLUSTERED',
    is_unique BOOLEAN DEFAULT FALSE,
    columns JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT indexes_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT indexes_type_valid CHECK (type IN ('CLUSTERED', 'NONCLUSTERED')),
    CONSTRAINT indexes_columns_not_empty CHECK (jsonb_array_length(columns) > 0),
    UNIQUE(table_id, name)
);

-- 감사 로그 테이블
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT audit_logs_entity_type_valid CHECK (entity_type IN ('PROJECT', 'TABLE', 'COLUMN', 'INDEX')),
    CONSTRAINT audit_logs_action_valid CHECK (action IN ('CREATE', 'UPDATE', 'DELETE'))
);