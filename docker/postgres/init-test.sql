-- 테스트 환경 PostgreSQL 초기화 스크립트
-- Database Modeling Tool Test Environment

-- 테스트용 데이터베이스가 이미 존재하는지 확인
SELECT 'CREATE DATABASE dbmodeling_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'dbmodeling_test')\gexec

-- 테스트용 사용자 생성 (이미 존재하지 않는 경우)
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'dbmodeling_test_user') THEN

      CREATE ROLE dbmodeling_test_user LOGIN PASSWORD 'test_password';
   END IF;
END
$do$;

-- 테스트용 사용자에게 권한 부여
GRANT ALL PRIVILEGES ON DATABASE dbmodeling_test TO dbmodeling_test_user;

-- 연결하여 스키마 권한 설정
\c dbmodeling_test

-- public 스키마에 대한 권한 부여
GRANT ALL ON SCHEMA public TO dbmodeling_test_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dbmodeling_test_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dbmodeling_test_user;

-- 향후 생성될 테이블에 대한 기본 권한 설정
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dbmodeling_test_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dbmodeling_test_user;

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 테스트 환경 설정 완료 메시지
SELECT 'Test database setup completed successfully' AS status;