-- 개발 환경 PostgreSQL 초기화 스크립트
-- Database Modeling Tool Development Environment

-- 개발용 데이터베이스가 이미 존재하는지 확인
SELECT 'CREATE DATABASE dbmodeling_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'dbmodeling_dev')\gexec

-- 개발용 사용자 생성 (이미 존재하지 않는 경우)
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'dbmodeling_dev_user') THEN

      CREATE ROLE dbmodeling_dev_user LOGIN PASSWORD 'dev_password';
   END IF;
END
$do$;

-- 개발용 사용자에게 권한 부여
GRANT ALL PRIVILEGES ON DATABASE dbmodeling_dev TO dbmodeling_dev_user;

-- 연결하여 스키마 권한 설정
\c dbmodeling_dev

-- public 스키마에 대한 권한 부여
GRANT ALL ON SCHEMA public TO dbmodeling_dev_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dbmodeling_dev_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dbmodeling_dev_user;

-- 향후 생성될 테이블에 대한 기본 권한 설정
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dbmodeling_dev_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dbmodeling_dev_user;

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 개발 환경 설정 완료 메시지
SELECT 'Development database setup completed successfully' AS status;