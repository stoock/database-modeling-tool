-- 테스트 환경용 데이터

-- 테스트 프로젝트
INSERT INTO projects (id, name, description, naming_rules)
VALUES 
('00000000-0000-0000-0000-000000000001', 
 'Test Project', 
 'Test database modeling project',
 '{
    "tablePrefix": null,
    "tableSuffix": null,
    "tablePattern": "^[A-Z][a-zA-Z0-9]*$",
    "columnPattern": "^[a-z][a-z0-9_]*$",
    "indexPattern": "^IX_.*$",
    "enforceCase": "PASCAL"
 }'::jsonb);

-- 테스트 테이블
INSERT INTO tables (id, project_id, name, description, position_x, position_y)
VALUES 
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'TestTable', 'Test table', 100, 100);

-- 테스트 컬럼
INSERT INTO columns (id, table_id, name, description, data_type, max_length, is_nullable, is_primary_key, is_identity, order_index)
VALUES 
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'id', 'Primary key', 'BIGINT', null, false, true, true, 0),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'name', 'Name', 'NVARCHAR', 100, false, false, false, 1),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'created_at', 'Created timestamp', 'DATETIME2', null, false, false, false, 2);

-- 테스트 인덱스
INSERT INTO indexes (id, table_id, name, type, is_unique, columns)
VALUES 
('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 'IX_TestTable_Name', 'NONCLUSTERED', true, 
 '[{"columnId": "00000000-0000-0000-0000-000000000004", "order": "ASC"}]'::jsonb);