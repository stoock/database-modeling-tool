-- Database Modeling Tool 초기 데이터 삽입
-- 버전: 3.0.0
-- 개발 및 테스트를 위한 샘플 데이터

-- 샘플 프로젝트 생성
INSERT INTO projects (id, name, description, naming_rules) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Sample E-Commerce Project',
    '전자상거래 시스템을 위한 샘플 데이터베이스 모델링 프로젝트',
    '{
        "tablePrefix": null,
        "tableSuffix": null,
        "tablePattern": "^[A-Z][a-zA-Z0-9]*$",
        "columnPattern": "^[a-z][a-z0-9_]*$",
        "indexPattern": "^IX_.*$",
        "enforceCase": "PASCAL"
    }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 사용자 테이블
INSERT INTO tables (id, project_id, name, description, position_x, position_y) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'User',
    '사용자 정보 테이블',
    100,
    100
) ON CONFLICT (project_id, name) DO NOTHING;

-- 상품 테이블
INSERT INTO tables (id, project_id, name, description, position_x, position_y) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440000',
    'Product',
    '상품 정보 테이블',
    400,
    100
) ON CONFLICT (project_id, name) DO NOTHING;

-- 주문 테이블
INSERT INTO tables (id, project_id, name, description, position_x, position_y) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440009',
    '550e8400-e29b-41d4-a716-446655440000',
    'Order',
    '주문 정보 테이블',
    250,
    300
) ON CONFLICT (project_id, name) DO NOTHING;

-- User 테이블 컬럼들
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
    'password_hash',
    '암호화된 비밀번호',
    'NVARCHAR',
    255,
    false,
    false,
    false,
    3
),
(
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440001',
    'created_at',
    '생성일시',
    'DATETIME2',
    null,
    false,
    false,
    false,
    4
),
(
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440001',
    'updated_at',
    '수정일시',
    'DATETIME2',
    null,
    false,
    false,
    false,
    5
) ON CONFLICT (table_id, name) DO NOTHING;

-- Product 테이블 컬럼들
INSERT INTO columns (id, table_id, name, description, data_type, max_length, precision_value, scale_value, is_nullable, is_primary_key, is_identity, order_index) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440008',
    'id',
    '상품 ID',
    'BIGINT',
    null,
    null,
    null,
    false,
    true,
    true,
    0
),
(
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440008',
    'name',
    '상품명',
    'NVARCHAR',
    255,
    null,
    null,
    false,
    false,
    false,
    1
),
(
    '550e8400-e29b-41d4-a716-446655440014',
    '550e8400-e29b-41d4-a716-446655440008',
    'description',
    '상품 설명',
    'NVARCHAR',
    1000,
    null,
    null,
    true,
    false,
    false,
    2
),
(
    '550e8400-e29b-41d4-a716-446655440015',
    '550e8400-e29b-41d4-a716-446655440008',
    'price',
    '상품 가격',
    'DECIMAL',
    null,
    18,
    2,
    false,
    false,
    false,
    3
),
(
    '550e8400-e29b-41d4-a716-446655440016',
    '550e8400-e29b-41d4-a716-446655440008',
    'stock_quantity',
    '재고 수량',
    'INT',
    null,
    null,
    null,
    false,
    false,
    false,
    4
),
(
    '550e8400-e29b-41d4-a716-446655440017',
    '550e8400-e29b-41d4-a716-446655440008',
    'created_at',
    '생성일시',
    'DATETIME2',
    null,
    null,
    null,
    false,
    false,
    false,
    5
) ON CONFLICT (table_id, name) DO NOTHING;

-- Order 테이블 컬럼들
INSERT INTO columns (id, table_id, name, description, data_type, max_length, precision_value, scale_value, is_nullable, is_primary_key, is_identity, order_index) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440018',
    '550e8400-e29b-41d4-a716-446655440009',
    'id',
    '주문 ID',
    'BIGINT',
    null,
    null,
    null,
    false,
    true,
    true,
    0
),
(
    '550e8400-e29b-41d4-a716-446655440019',
    '550e8400-e29b-41d4-a716-446655440009',
    'user_id',
    '사용자 ID (외래키)',
    'BIGINT',
    null,
    null,
    null,
    false,
    false,
    false,
    1
),
(
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440009',
    'order_date',
    '주문일시',
    'DATETIME2',
    null,
    null,
    null,
    false,
    false,
    false,
    2
),
(
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440009',
    'total_amount',
    '총 주문 금액',
    'DECIMAL',
    null,
    18,
    2,
    false,
    false,
    false,
    3
),
(
    '550e8400-e29b-41d4-a716-446655440022',
    '550e8400-e29b-41d4-a716-446655440009',
    'status',
    '주문 상태',
    'NVARCHAR',
    20,
    null,
    null,
    false,
    false,
    false,
    4
) ON CONFLICT (table_id, name) DO NOTHING;

-- User 테이블 인덱스들
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

-- Product 테이블 인덱스들
INSERT INTO indexes (id, table_id, name, type, is_unique, columns) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440023',
    '550e8400-e29b-41d4-a716-446655440008',
    'IX_Product_Name',
    'NONCLUSTERED',
    false,
    '[{"columnId": "550e8400-e29b-41d4-a716-446655440013", "order": "ASC"}]'::jsonb
),
(
    '550e8400-e29b-41d4-a716-446655440024',
    '550e8400-e29b-41d4-a716-446655440008',
    'IX_Product_Price',
    'NONCLUSTERED',
    false,
    '[{"columnId": "550e8400-e29b-41d4-a716-446655440015", "order": "ASC"}]'::jsonb
) ON CONFLICT (table_id, name) DO NOTHING;

-- Order 테이블 인덱스들
INSERT INTO indexes (id, table_id, name, type, is_unique, columns) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440025',
    '550e8400-e29b-41d4-a716-446655440009',
    'IX_Order_UserId',
    'NONCLUSTERED',
    false,
    '[{"columnId": "550e8400-e29b-41d4-a716-446655440019", "order": "ASC"}]'::jsonb
),
(
    '550e8400-e29b-41d4-a716-446655440026',
    '550e8400-e29b-41d4-a716-446655440009',
    'IX_Order_Date',
    'NONCLUSTERED',
    false,
    '[{"columnId": "550e8400-e29b-41d4-a716-446655440020", "order": "DESC"}]'::jsonb
),
(
    '550e8400-e29b-41d4-a716-446655440027',
    '550e8400-e29b-41d4-a716-446655440009',
    'IX_Order_Status',
    'NONCLUSTERED',
    false,
    '[{"columnId": "550e8400-e29b-41d4-a716-446655440022", "order": "ASC"}]'::jsonb
) ON CONFLICT (table_id, name) DO NOTHING;

-- 통계 정보 업데이트
ANALYZE projects;
ANALYZE tables;
ANALYZE columns;
ANALYZE indexes;