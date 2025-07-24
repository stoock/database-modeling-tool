#!/bin/bash

# Database Modeling Tool - 개발 환경 시작 스크립트

set -e

echo "🚀 Database Modeling Tool 개발 환경을 시작합니다..."

# 환경 변수 로드
if [ -f .env.dev ]; then
    echo "📋 개발 환경 변수를 로드합니다..."
    export $(cat .env.dev | grep -v '^#' | xargs)
else
    echo "⚠️  .env.dev 파일이 없습니다. 기본 설정을 사용합니다."
fi

# Docker 컨테이너 시작
echo "🐳 Docker 컨테이너를 시작합니다..."
docker-compose up -d postgres-dev pgadmin

# 데이터베이스 연결 대기
echo "⏳ 데이터베이스 연결을 기다립니다..."
timeout=30
counter=0

while ! docker exec dbmodeling-postgres-dev pg_isready -U postgres -d dbmodeling_dev > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ 데이터베이스 연결 시간 초과"
        exit 1
    fi
    echo "   데이터베이스 연결 대기 중... ($counter/$timeout)"
    sleep 1
    counter=$((counter + 1))
done

echo "✅ 데이터베이스가 준비되었습니다!"

# Flyway 마이그레이션 실행
echo "🔄 데이터베이스 마이그레이션을 실행합니다..."
cd backend
./mvnw flyway:migrate \
    -Dflyway.url=jdbc:postgresql://localhost:5432/dbmodeling_dev \
    -Dflyway.user=postgres \
    -Dflyway.password=postgres

# Spring Boot 애플리케이션 시작
echo "🌱 Spring Boot 애플리케이션을 시작합니다..."
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

echo "🎉 개발 환경이 성공적으로 시작되었습니다!"
echo ""
echo "📍 접속 정보:"
echo "   - 백엔드 API: http://localhost:8080/api"
echo "   - Swagger UI: http://localhost:8080/api/swagger-ui.html"
echo "   - pgAdmin: http://localhost:5050 (admin@dbmodeling.com / admin123)"
echo ""