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
((SELECT id FROM project_id), 'Category', '상품 카테고리 테이블', 700, 100),
((SELECT id FROM project_id), 'Order', '주문 정보 테이블', 100, 400),
((SELECT id FROM project_id), 'OrderItem', '주문 상품 정보 테이블', 400, 400),
((SELECT id FROM project_id), 'Payment', '결제 정보 테이블', 700, 400),
((SELECT id FROM project_id), 'Shipping', '배송 정보 테이블', 100, 700),
((SELECT id FROM project_id), 'Review', '상품 리뷰 테이블', 400, 700),
((SELECT id FROM project_id), 'Cart', '장바구니 테이블', 700, 700),
((SELECT id FROM project_id), 'Wishlist', '위시리스트 테이블', 1000, 100),
((SELECT id FROM project_id), 'Coupon', '쿠폰 테이블', 1000, 400),
((SELECT id FROM project_id), 'Address', '주소 정보 테이블', 1000, 700)
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

-- 샘플 컬럼 데이터 - Category 테이블
WITH table_id AS (SELECT id FROM tables WHERE name = 'Category' LIMIT 1)
INSERT INTO columns (table_id, name, description, data_type, max_length, is_nullable, is_primary_key, is_identity, order_index)
VALUES 
((SELECT id FROM table_id), 'id', '카테고리 ID', 'BIGINT', null, false, true, true, 0),
((SELECT id FROM table_id), 'name', '카테고리명', 'NVARCHAR', 100, false, false, false, 1),
((SELECT id FROM table_id), 'parent_id', '상위 카테고리 ID', 'BIGINT', null, true, false, false, 2),
((SELECT id FROM table_id), 'display_order', '표시 순서', 'INT', null, false, false, false, 3)
ON CONFLICT DO NOTHING;

-- 샘플 컬럼 데이터 - OrderItem 테이블
WITH table_id AS (SELECT id FROM tables WHERE name = 'OrderItem' LIMIT 1)
INSERT INTO columns (table_id, name, description, data_type, max_length, precision_value, scale_value, is_nullable, is_primary_key, is_identity, order_index)
VALUES 
((SELECT id FROM table_id), 'id', '주문 상품 ID', 'BIGINT', null, null, null, false, true, true, 0),
((SELECT id FROM table_id), 'order_id', '주문 ID', 'BIGINT', null, null, null, false, false, false, 1),
((SELECT id FROM table_id), 'product_id', '상품 ID', 'BIGINT', null, null, null, false, false, false, 2),
((SELECT id FROM table_id), 'quantity', '수량', 'INT', null, null, null, false, false, false, 3),
((SELECT id FROM table_id), 'unit_price', '단가', 'DECIMAL', null, 18, 2, false, false, false, 4),
((SELECT id FROM table_id), 'total_price', '총 금액', 'DECIMAL', null, 18, 2, false, false, false, 5)
ON CONFLICT DO NOTHING;

-- 샘플 컬럼 데이터 - Payment 테이블
WITH table_id AS (SELECT id FROM tables WHERE name = 'Payment' LIMIT 1)
INSERT INTO columns (table_id, name, description, data_type, max_length, precision_value, scale_value, is_nullable, is_primary_key, is_identity, order_index)
VALUES 
((SELECT id FROM table_id), 'id', '결제 ID', 'BIGINT', null, null, null, false, true, true, 0),
((SELECT id FROM table_id), 'order_id', '주문 ID', 'BIGINT', null, null, null, false, false, false, 1),
((SELECT id FROM table_id), 'payment_method', '결제 수단', 'NVARCHAR', 50, null, null, false, false, false, 2),
((SELECT id FROM table_id), 'amount', '결제 금액', 'DECIMAL', null, 18, 2, false, false, false, 3),
((SELECT id FROM table_id), 'status', '결제 상태', 'NVARCHAR', 20, null, null, false, false, false, 4),
((SELECT id FROM table_id), 'paid_at', '결제일시', 'DATETIME2', null, null, null, true, false, false, 5)
ON CONFLICT DO NOTHING;

-- 샘플 컬럼 데이터 - Shipping 테이블
WITH table_id AS (SELECT id FROM tables WHERE name = 'Shipping' LIMIT 1)
INSERT INTO columns (table_id, name, description, data_type, max_length, is_nullable, is_primary_key, is_identity, order_index)
VALUES 
((SELECT id FROM table_id), 'id', '배송 ID', 'BIGINT', null, false, true, true, 0),
((SELECT id FROM table_id), 'order_id', '주문 ID', 'BIGINT', null, false, false, false, 1),
((SELECT id FROM table_id), 'tracking_number', '송장 번호', 'NVARCHAR', 100, true, false, false, 2),
((SELECT id FROM table_id), 'carrier', '배송 업체', 'NVARCHAR', 50, false, false, false, 3),
((SELECT id FROM table_id), 'status', '배송 상태', 'NVARCHAR', 20, false, false, false, 4),
((SELECT id FROM table_id), 'shipped_at', '발송일시', 'DATETIME2', null, true, false, false, 5),
((SELECT id FROM table_id), 'delivered_at', '배송완료일시', 'DATETIME2', null, true, false, false, 6)
ON CONFLICT DO NOTHING;

-- 샘플 컬럼 데이터 - Review 테이블
WITH table_id AS (SELECT id FROM tables WHERE name = 'Review' LIMIT 1)
INSERT INTO columns (table_id, name, description, data_type, max_length, is_nullable, is_primary_key, is_identity, order_index)
VALUES 
((SELECT id FROM table_id), 'id', '리뷰 ID', 'BIGINT', null, false, true, true, 0),
((SELECT id FROM table_id), 'product_id', '상품 ID', 'BIGINT', null, false, false, false, 1),
((SELECT id FROM table_id), 'user_id', '사용자 ID', 'BIGINT', null, false, false, false, 2),
((SELECT id FROM table_id), 'rating', '평점', 'INT', null, false, false, false, 3),
((SELECT id FROM table_id), 'title', '리뷰 제목', 'NVARCHAR', 200, false, false, false, 4),
((SELECT id FROM table_id), 'content', '리뷰 내용', 'NVARCHAR', 2000, false, false, false, 5),
((SELECT id FROM table_id), 'created_at', '작성일시', 'DATETIME2', null, false, false, false, 6)
ON CONFLICT DO NOTHING;

-- 샘플 컬럼 데이터 - Cart 테이블
WITH table_id AS (SELECT id FROM tables WHERE name = 'Cart' LIMIT 1)
INSERT INTO columns (table_id, name, description, data_type, max_length, is_nullable, is_primary_key, is_identity, order_index)
VALUES 
((SELECT id FROM table_id), 'id', '장바구니 ID', 'BIGINT', null, false, true, true, 0),
((SELECT id FROM table_id), 'user_id', '사용자 ID', 'BIGINT', null, false, false, false, 1),
((SELECT id FROM table_id), 'product_id', '상품 ID', 'BIGINT', null, false, false, false, 2),
((SELECT id FROM table_id), 'quantity', '수량', 'INT', null, false, false, false, 3),
((SELECT id FROM table_id), 'added_at', '추가일시', 'DATETIME2', null, false, false, false, 4)
ON CONFLICT DO NOTHING;

-- 샘플 컬럼 데이터 - Wishlist 테이블
WITH table_id AS (SELECT id FROM tables WHERE name = 'Wishlist' LIMIT 1)
INSERT INTO columns (table_id, name, description, data_type, max_length, is_nullable, is_primary_key, is_identity, order_index)
VALUES 
((SELECT id FROM table_id), 'id', '위시리스트 ID', 'BIGINT', null, false, true, true, 0),
((SELECT id FROM table_id), 'user_id', '사용자 ID', 'BIGINT', null, false, false, false, 1),
((SELECT id FROM table_id), 'product_id', '상품 ID', 'BIGINT', null, false, false, false, 2),
((SELECT id FROM table_id), 'added_at', '추가일시', 'DATETIME2', null, false, false, false, 3)
ON CONFLICT DO NOTHING;

-- 샘플 컬럼 데이터 - Coupon 테이블
WITH table_id AS (SELECT id FROM tables WHERE name = 'Coupon' LIMIT 1)
INSERT INTO columns (table_id, name, description, data_type, max_length, precision_value, scale_value, is_nullable, is_primary_key, is_identity, order_index)
VALUES 
((SELECT id FROM table_id), 'id', '쿠폰 ID', 'BIGINT', null, null, null, false, true, true, 0),
((SELECT id FROM table_id), 'code', '쿠폰 코드', 'NVARCHAR', 50, null, null, false, false, false, 1),
((SELECT id FROM table_id), 'discount_type', '할인 유형', 'NVARCHAR', 20, null, null, false, false, false, 2),
((SELECT id FROM table_id), 'discount_value', '할인 값', 'DECIMAL', null, 18, 2, false, false, false, 3),
((SELECT id FROM table_id), 'valid_from', '유효 시작일', 'DATETIME2', null, null, null, false, false, false, 4),
((SELECT id FROM table_id), 'valid_until', '유효 종료일', 'DATETIME2', null, null, null, false, false, false, 5)
ON CONFLICT DO NOTHING;

-- 샘플 컬럼 데이터 - Address 테이블
WITH table_id AS (SELECT id FROM tables WHERE name = 'Address' LIMIT 1)
INSERT INTO columns (table_id, name, description, data_type, max_length, is_nullable, is_primary_key, is_identity, order_index)
VALUES 
((SELECT id FROM table_id), 'id', '주소 ID', 'BIGINT', null, false, true, true, 0),
((SELECT id FROM table_id), 'user_id', '사용자 ID', 'BIGINT', null, false, false, false, 1),
((SELECT id FROM table_id), 'address_type', '주소 유형', 'NVARCHAR', 20, false, false, false, 2),
((SELECT id FROM table_id), 'recipient_name', '수령인명', 'NVARCHAR', 100, false, false, false, 3),
((SELECT id FROM table_id), 'phone', '전화번호', 'NVARCHAR', 20, false, false, false, 4),
((SELECT id FROM table_id), 'postal_code', '우편번호', 'NVARCHAR', 10, false, false, false, 5),
((SELECT id FROM table_id), 'address_line1', '주소1', 'NVARCHAR', 200, false, false, false, 6),
((SELECT id FROM table_id), 'address_line2', '주소2', 'NVARCHAR', 200, true, false, false, 7),
((SELECT id FROM table_id), 'is_default', '기본 주소 여부', 'BIT', null, false, false, false, 8)
ON CONFLICT DO NOTHING;

-- 통계 정보 업데이트
ANALYZE projects;
ANALYZE tables;
ANALYZE columns;
ANALYZE indexes;