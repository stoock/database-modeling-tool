-- 개발 환경용 샘플 데이터

-- 샘플 프로젝트 데이터
INSERT INTO projects (name, description, naming_rules)
VALUES 
('MSSQL 샘플 프로젝트', 
 'MSSQL 데이터베이스 모델링 도구 개발용 샘플 프로젝트',
 '{
    "tablePrefix": null,
    "tableSuffix": null,
    "tablePattern": "^[A-Z][a-zA-Z0-9]*$",
    "columnPattern": "^[a-z][a-z0-9_]*$",
    "indexPattern": "^IX_.*$",
    "enforceCase": "PASCAL"
 }'::jsonb)
ON CONFLICT DO NOTHING;

-- 샘플 테이블 데이터
WITH project_id AS (SELECT id FROM projects WHERE name = 'MSSQL 샘플 프로젝트' LIMIT 1)
INSERT INTO tables (project_id, name, description, position_x, position_y)
VALUES 
((SELECT id FROM project_id), 'User', '사용자 정보 테이블', 100, 100),
((SELECT id FROM project_id), 'Product', '제품 정보 테이블', 400, 100),
((SELECT id FROM project_id), 'Order', '주문 정보 테이블', 100, 400),
((SELECT id FROM project_id), 'OrderItem', '주문 상품 정보 테이블', 400, 400)
ON CONFLICT DO NOTHING;

-- 샘플 컬럼 데이터 - User 테이블
WITH table_id AS (SELECT id FROM tables WHERE name = 'User' LIMIT 1)
INSERT INTO columns (table_id, name, description, data_type, max_length, is_nullable, is_primary_key, is_identity, order_index)
VALUES 
((SELECT id FROM table_id), 'id', '사용자 ID', 'BIGINT', null, false, true, true, 0),
((SELECT id FROM table_id), 'username', '사용자명', 'NVARCHAR', 50, false, false, false, 1),
((SELECT id FROM table_id), 'email', '이메일 주소', 'NVARCHAR', 255, false, false, false, 2),
((SELECT id FROM table_id), 'password_hash', '비밀번호 해시', 'NVARCHAR', 255, false, false, false, 3),
((SELECT id FROM table_id), 'full_name', '전체 이름', 'NVARCHAR', 100, true, false, false, 4),
((SELECT id FROM table_id), 'created_at', '생성일시', 'DATETIME2', null, false, false, false, 5),
((SELECT id FROM table_id), 'updated_at', '수정일시', 'DATETIME2', null, false, false, false, 6)
ON CONFLICT DO NOTHING;

-- 샘플 컬럼 데이터 - Product 테이블
WITH table_id AS (SELECT id FROM tables WHERE name = 'Product' LIMIT 1)
INSERT INTO columns (table_id, name, description, data_type, max_length, precision_value, scale_value, is_nullable, is_primary_key, is_identity, order_index)
VALUES 
((SELECT id FROM table_id), 'id', '제품 ID', 'BIGINT', null, null, null, false, true, true, 0),
((SELECT id FROM table_id), 'name', '제품명', 'NVARCHAR', 100, null, null, false, false, false, 1),
((SELECT id FROM table_id), 'description', '제품 설명', 'NVARCHAR', 500, null, null, true, false, false, 2),
((SELECT id FROM table_id), 'price', '가격', 'DECIMAL', null, 18, 2, false, false, false, 3),
((SELECT id FROM table_id), 'stock_quantity', '재고 수량', 'INT', null, null, null, false, false, false, 4),
((SELECT id FROM table_id), 'created_at', '생성일시', 'DATETIME2', null, null, null, false, false, false, 5),
((SELECT id FROM table_id), 'updated_at', '수정일시', 'DATETIME2', null, null, null, false, false, false, 6)
ON CONFLICT DO NOTHING;

-- 샘플 인덱스 데이터
WITH user_table AS (SELECT id FROM tables WHERE name = 'User' LIMIT 1)
INSERT INTO indexes (table_id, name, type, is_unique, columns)
VALUES 
((SELECT id FROM user_table), 'IX_User_Username', 'NONCLUSTERED', true, 
 (SELECT json_build_array(json_build_object('columnId', id, 'order', 'ASC')) FROM columns WHERE table_id = (SELECT id FROM user_table) AND name = 'username')),
((SELECT id FROM user_table), 'IX_User_Email', 'NONCLUSTERED', true, 
 (SELECT json_build_array(json_build_object('columnId', id, 'order', 'ASC')) FROM columns WHERE table_id = (SELECT id FROM user_table) AND name = 'email'))
ON CONFLICT DO NOTHING;

-- 통계 정보 업데이트
ANALYZE projects;
ANALYZE tables;
ANALYZE columns;
ANALYZE indexes;