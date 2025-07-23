-- Database Modeling Tool 초기 스키마 생성
-- 버전: 1.0.0

-- 프로젝트 테이블
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    naming_rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT projects_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- 프로젝트 이름에 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- 테이블 정의
CREATE TABLE IF NOT EXISTS tables (
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

-- 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_tables_project_id ON tables(project_id);
CREATE INDEX IF NOT EXISTS idx_tables_name ON tables(name);

-- 컬럼 정의
CREATE TABLE IF NOT EXISTS columns (
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

-- 컬럼 인덱스
CREATE INDEX IF NOT EXISTS idx_columns_table_id ON columns(table_id);
CREATE INDEX IF NOT EXISTS idx_columns_order_index ON columns(table_id, order_index);
CREATE INDEX IF NOT EXISTS idx_columns_primary_key ON columns(table_id, is_primary_key) WHERE is_primary_key = TRUE;

-- 인덱스 정의
CREATE TABLE IF NOT EXISTS indexes (
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

-- 인덱스 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_indexes_table_id ON indexes(table_id);
CREATE INDEX IF NOT EXISTS idx_indexes_name ON indexes(name);
CREATE INDEX IF NOT EXISTS idx_indexes_type ON indexes(type);

-- 감사 로그 테이블 (선택적)
CREATE TABLE IF NOT EXISTS audit_logs (
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

-- 감사 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_columns_updated_at BEFORE UPDATE ON columns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_indexes_updated_at BEFORE UPDATE ON indexes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 기본 데이터 삽입 (개발 환경용)
INSERT INTO projects (id, name, description, naming_rules) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Sample Project',
    '샘플 데이터베이스 모델링 프로젝트',
    '{
        "tablePrefix": null,
        "tableSuffix": null,
        "tablePattern": "^[A-Z][a-zA-Z0-9]*$",
        "columnPattern": "^[a-z][a-z0-9_]*$",
        "indexPattern": "^IX_.*$",
        "enforceCase": "PASCAL"
    }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 샘플 테이블
INSERT INTO tables (id, project_id, name, description, position_x, position_y) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'User',
    '사용자 정보 테이블',
    100,
    100
) ON CONFLICT (project_id, name) DO NOTHING;

-- 샘플 컬럼들
INSERT INTO columns (id, table_id, name, description, data_type, max_length, is_nullable, is_primary_key, is_identity, order_index) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'id',
    '사용자 ID',
    'BIGINT',
    null,
    false,
    true,
    true,
    0
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    'username',
    '사용자명',
    'NVARCHAR',
    50,
    false,
    false,
    false,
    1
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440001',
    'email',
    '이메일 주소',
    'NVARCHAR',
    255,
    false,
    false,
    false,
    2
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440001',
    'created_at',
    '생성일시',
    'DATETIME2',
    null,
    false,
    false,
    false,
    3
) ON CONFLICT (table_id, name) DO NOTHING;

-- 샘플 인덱스
INSERT INTO indexes (id, table_id, name, type, is_unique, columns) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440001',
    'IX_User_Username',
    'NONCLUSTERED',
    true,
    '[{"columnId": "550e8400-e29b-41d4-a716-446655440003", "order": "ASC"}]'::jsonb
),
(
    '550e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440001',
    'IX_User_Email',
    'NONCLUSTERED',
    true,
    '[{"columnId": "550e8400-e29b-41d4-a716-446655440004", "order": "ASC"}]'::jsonb
) ON CONFLICT (table_id, name) DO NOTHING;

-- 통계 정보 업데이트
ANALYZE projects;
ANALYZE tables;
ANALYZE columns;
ANALYZE indexes;