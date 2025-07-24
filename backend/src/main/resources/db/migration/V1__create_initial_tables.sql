-- Database Modeling Tool 초기 스키마 생성
-- 버전: 1.0.0
-- MSSQL 데이터베이스 모델링 도구를 위한 PostgreSQL 스키마

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
    CONSTRAINT columns_length_positive CHECK (max_length IS NULL OR max_length > 0),
    CONSTRAINT columns_precision_positive CHECK (precision_value IS NULL OR precision_value > 0),
    CONSTRAINT columns_scale_valid CHECK (scale_value IS NULL OR (scale_value >= 0 AND scale_value <= precision_value)),
    CONSTRAINT columns_identity_seed_positive CHECK (identity_seed IS NULL OR identity_seed >= 0),
    CONSTRAINT columns_identity_increment_positive CHECK (identity_increment IS NULL OR identity_increment > 0),
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

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at 
    BEFORE UPDATE ON tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_columns_updated_at 
    BEFORE UPDATE ON columns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_indexes_updated_at 
    BEFORE UPDATE ON indexes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();