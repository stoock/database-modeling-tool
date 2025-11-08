# API 문서

MSSQL 데이터베이스 모델링 도구 REST API 명세

## 📋 목차

1. [개요](#개요)
2. [인증](#인증)
3. [공통 응답 형식](#공통-응답-형식)
4. [헬스 체크 API](#헬스-체크-api)
5. [프로젝트 API](#프로젝트-api)
6. [테이블 API](#테이블-api)
7. [컬럼 API](#컬럼-api)
8. [인덱스 API](#인덱스-api)
9. [검증 API](#검증-api)
10. [내보내기 API](#내보내기-api)
11. [에러 코드](#에러-코드)

## 개요

### Base URL
```
http://localhost:8080/api
```

### Swagger UI
```
http://localhost:8080/api/swagger-ui.html
```

### Content-Type
```
application/json
```

## 인증

현재 버전에서는 인증이 필요하지 않습니다. (향후 추가 예정)

## 공통 응답 형식

### 성공 응답
```json
{
  "data": { ... },
  "message": "성공 메시지",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 에러 응답
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": { ... }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 헬스 체크 API

### 시스템 상태 확인
```http
GET /api/health
```

API 서버와 데이터베이스 연결 상태를 확인합니다.

**응답 예시 (정상)**
```json
{
  "status": "UP",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Database Modeling Tool API",
  "version": "1.0.0",
  "database": "UP"
}
```

**응답 예시 (데이터베이스 연결 실패)**
```json
{
  "status": "DEGRADED",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Database Modeling Tool API",
  "version": "1.0.0",
  "database": "DOWN",
  "message": "PostgreSQL 데이터베이스에 연결할 수 없습니다. Docker 컨테이너가 실행 중인지 확인하세요.",
  "hint": "실행 명령: docker-compose up -d 또는 .\\scripts\\01-env-setup.ps1"
}
```

**HTTP 상태 코드**
- `200 OK`: 모든 시스템이 정상 작동 중
- `503 Service Unavailable`: 데이터베이스 연결 실패 등 일부 시스템 장애

**사용 예시**
```bash
# cURL
curl http://localhost:8080/api/health

# PowerShell
Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method Get
```

**헬스 체크 활용**
- 배포 후 시스템 상태 확인
- 모니터링 시스템 연동
- 로드 밸런서 헬스 체크
- 개발 환경 설정 검증

## 프로젝트 API

### 프로젝트 목록 조회
```http
GET /api/projects
```

**응답 예시**
```json
[
  {
    "id": "uuid",
    "name": "프로젝트명",
    "description": "프로젝트 설명",
    "namingRules": {
      "tablePrefix": "tbl_",
      "columnPattern": "^[a-z_]+$",
      "enforceCase": "SNAKE"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### 프로젝트 상세 조회
```http
GET /api/projects/{id}
```

**경로 파라미터**
- `id` (string, required): 프로젝트 ID

**응답 예시**
```json
{
  "id": "uuid",
  "name": "프로젝트명",
  "description": "프로젝트 설명",
  "namingRules": { ... },
  "tables": [
    {
      "id": "uuid",
      "name": "User",
      "description": "사용자 테이블",
      "columns": [ ... ],
      "indexes": [ ... ]
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 프로젝트 생성
```http
POST /api/projects
```

**요청 본문**
```json
{
  "name": "프로젝트명",
  "description": "프로젝트 설명",
  "namingRules": {
    "tablePrefix": "tbl_",
    "tableSuffix": "",
    "tablePattern": "^[A-Z][a-zA-Z0-9]*$",
    "columnPattern": "^[a-z_]+$",
    "indexPattern": "^IX_[A-Z][a-zA-Z0-9_]*$",
    "enforceCase": "SNAKE"
  }
}
```

**응답 예시**
```json
{
  "id": "uuid",
  "name": "프로젝트명",
  "description": "프로젝트 설명",
  "namingRules": { ... },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 프로젝트 수정
```http
PUT /api/projects/{id}
```

**경로 파라미터**
- `id` (string, required): 프로젝트 ID

**요청 본문**
```json
{
  "name": "수정된 프로젝트명",
  "description": "수정된 설명",
  "namingRules": { ... }
}
```

### 프로젝트 삭제
```http
DELETE /api/projects/{id}
```

**경로 파라미터**
- `id` (string, required): 프로젝트 ID

**응답**
```
204 No Content
```

## 테이블 API

### 테이블 목록 조회
```http
GET /api/projects/{projectId}/tables
```

**경로 파라미터**
- `projectId` (string, required): 프로젝트 ID

**응답 예시**
```json
[
  {
    "id": "uuid",
    "projectId": "uuid",
    "name": "User",
    "description": "사용자 테이블",
    "positionX": 100,
    "positionY": 200,
    "columns": [ ... ],
    "indexes": [ ... ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### 테이블 생성
```http
POST /api/projects/{projectId}/tables
```

**경로 파라미터**
- `projectId` (string, required): 프로젝트 ID

**요청 본문**
```json
{
  "name": "User",
  "description": "사용자 - 시스템 사용자 정보",
  "positionX": 100,
  "positionY": 200
}
```

### 테이블 수정
```http
PUT /api/tables/{id}
```

**경로 파라미터**
- `id` (string, required): 테이블 ID

**요청 본문**
```json
{
  "name": "User",
  "description": "수정된 설명",
  "positionX": 150,
  "positionY": 250
}
```

### 테이블 삭제
```http
DELETE /api/tables/{id}
```

**경로 파라미터**
- `id` (string, required): 테이블 ID

## 컬럼 API

### 컬럼 생성
```http
POST /api/tables/{tableId}/columns
```

**경로 파라미터**
- `tableId` (string, required): 테이블 ID

**요청 본문**
```json
{
  "name": "user_id",
  "description": "사용자 ID - 기본키",
  "dataType": "BIGINT",
  "maxLength": null,
  "precision": null,
  "scale": null,
  "nullable": false,
  "primaryKey": true,
  "identity": true,
  "identitySeed": 1,
  "identityIncrement": 1,
  "defaultValue": null,
  "orderIndex": 0
}
```

**응답 예시**
```json
{
  "id": "uuid",
  "tableId": "uuid",
  "name": "user_id",
  "description": "사용자 ID - 기본키",
  "dataType": "BIGINT",
  "nullable": false,
  "primaryKey": true,
  "identity": true,
  "identitySeed": 1,
  "identityIncrement": 1,
  "orderIndex": 0,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 컬럼 수정
```http
PUT /api/columns/{id}
```

**경로 파라미터**
- `id` (string, required): 컬럼 ID

**요청 본문**
```json
{
  "name": "user_name",
  "description": "사용자명",
  "dataType": "NVARCHAR",
  "maxLength": 100,
  "nullable": false,
  "defaultValue": "'N/A'",
  "orderIndex": 1
}
```

### 컬럼 삭제
```http
DELETE /api/columns/{id}
```

**경로 파라미터**
- `id` (string, required): 컬럼 ID

### 컬럼 순서 변경 (배치)
```http
PUT /api/tables/{tableId}/columns/reorder
```

**경로 파라미터**
- `tableId` (string, required): 테이블 ID

**요청 본문**
```json
{
  "updates": [
    {
      "columnId": "uuid1",
      "orderIndex": 0
    },
    {
      "columnId": "uuid2",
      "orderIndex": 1
    }
  ]
}
```

## 인덱스 API

### 인덱스 생성
```http
POST /api/tables/{tableId}/indexes
```

**경로 파라미터**
- `tableId` (string, required): 테이블 ID

**요청 본문**
```json
{
  "name": "IX_User_Email",
  "type": "NONCLUSTERED",
  "unique": true,
  "columns": [
    {
      "columnId": "uuid",
      "order": "ASC"
    }
  ]
}
```

**응답 예시**
```json
{
  "id": "uuid",
  "tableId": "uuid",
  "name": "IX_User_Email",
  "type": "NONCLUSTERED",
  "unique": true,
  "columns": [
    {
      "columnId": "uuid",
      "columnName": "email",
      "order": "ASC"
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 인덱스 수정
```http
PUT /api/indexes/{id}
```

**경로 파라미터**
- `id` (string, required): 인덱스 ID

**요청 본문**
```json
{
  "name": "IX_User_Email_Updated",
  "type": "NONCLUSTERED",
  "unique": true,
  "columns": [ ... ]
}
```

### 인덱스 삭제
```http
DELETE /api/indexes/{id}
```

**경로 파라미터**
- `id` (string, required): 인덱스 ID

## 검증 API

### 프로젝트 검증
```http
POST /api/projects/{projectId}/validate
```

**경로 파라미터**
- `projectId` (string, required): 프로젝트 ID

**응답 예시**
```json
{
  "valid": false,
  "errors": [
    {
      "type": "NAMING_RULE_VIOLATION",
      "severity": "ERROR",
      "entity": "TABLE",
      "entityId": "uuid",
      "entityName": "users",
      "field": "name",
      "message": "테이블명이 네이밍 규칙을 위반했습니다",
      "expected": "User (PascalCase)",
      "actual": "users",
      "suggestion": "User"
    },
    {
      "type": "MISSING_PRIMARY_KEY",
      "severity": "ERROR",
      "entity": "TABLE",
      "entityId": "uuid",
      "entityName": "Order",
      "message": "기본키가 정의되지 않았습니다",
      "suggestion": "id 컬럼을 기본키로 설정하세요"
    }
  ],
  "warnings": [
    {
      "type": "MISSING_INDEX",
      "severity": "WARNING",
      "entity": "COLUMN",
      "entityId": "uuid",
      "entityName": "email",
      "message": "자주 조회되는 컬럼에 인덱스가 없습니다",
      "suggestion": "email 컬럼에 인덱스를 추가하세요"
    }
  ]
}
```

### 네이밍 규칙 검증
```http
POST /api/validation/naming
```

**요청 본문**
```json
{
  "type": "TABLE",
  "name": "users",
  "rules": {
    "tablePattern": "^[A-Z][a-zA-Z0-9]*$",
    "enforceCase": "PASCAL"
  }
}
```

**응답 예시**
```json
{
  "valid": false,
  "message": "테이블명이 PascalCase 규칙을 위반했습니다",
  "expected": "Users",
  "actual": "users",
  "suggestion": "Users"
}
```

## 내보내기 API

### SQL 스크립트 생성
```http
POST /api/projects/{projectId}/export/sql
```

**경로 파라미터**
- `projectId` (string, required): 프로젝트 ID

**요청 본문**
```json
{
  "includeDropStatements": false,
  "includeComments": true,
  "includeIndexes": true,
  "includeConstraints": true
}
```

**응답 예시**
```json
{
  "format": "SQL",
  "content": "-- 프로젝트: 테스트 프로젝트\n-- 생성일: 2024-01-01\n\nCREATE TABLE [User] (\n  [user_id] BIGINT IDENTITY(1,1) NOT NULL,\n  [user_name] NVARCHAR(100) NOT NULL,\n  [email] NVARCHAR(255) NOT NULL,\n  [created_at] DATETIME2 DEFAULT GETDATE(),\n  CONSTRAINT [PK_User] PRIMARY KEY CLUSTERED ([user_id])\n);\n\nCREATE UNIQUE NONCLUSTERED INDEX [IX_User_Email] ON [User] ([email] ASC);\n",
  "fileName": "schema_20240101_000000.sql",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### JSON 형식 내보내기
```http
POST /api/projects/{projectId}/export/json
```

**응답 예시**
```json
{
  "format": "JSON",
  "content": {
    "project": {
      "name": "테스트 프로젝트",
      "tables": [ ... ]
    }
  },
  "fileName": "schema_20240101_000000.json",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Markdown 문서 생성
```http
POST /api/projects/{projectId}/export/markdown
```

**응답 예시**
```json
{
  "format": "MARKDOWN",
  "content": "# 데이터베이스 스키마 문서\n\n## 프로젝트: 테스트 프로젝트\n\n### 테이블: User\n\n**설명**: 사용자 테이블\n\n| 컬럼명 | 데이터 타입 | NULL | 기본값 | 설명 |\n|--------|------------|------|--------|------|\n| user_id | BIGINT | NO | IDENTITY | 사용자 ID |\n| user_name | NVARCHAR(100) | NO | - | 사용자명 |\n| email | NVARCHAR(255) | NO | - | 이메일 |\n\n**인덱스**:\n- IX_User_Email (UNIQUE, NONCLUSTERED): email\n",
  "fileName": "schema_20240101_000000.md",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### HTML 문서 생성
```http
POST /api/projects/{projectId}/export/html
```

### CSV 형식 내보내기
```http
POST /api/projects/{projectId}/export/csv
```

**응답 예시**
```json
{
  "format": "CSV",
  "content": "테이블명,컬럼명,데이터타입,길이,NULL허용,기본값,설명\nUser,user_id,BIGINT,,NO,IDENTITY,사용자 ID\nUser,user_name,NVARCHAR,100,NO,,사용자명\nUser,email,NVARCHAR,255,NO,,이메일\n",
  "fileName": "schema_20240101_000000.csv",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 에러 코드

프론트엔드는 중앙 집중식 에러 핸들러(`frontend/src/lib/errorHandler.ts`)를 통해 모든 API 에러를 처리하며, 사용자에게 명확한 피드백을 제공합니다. 자세한 내용은 [ERROR_HANDLING.md](docs/ERROR_HANDLING.md)를 참조하세요.

### 4xx 클라이언트 에러

| 코드 | 메시지 | 설명 |
|------|--------|------|
| 400 | BAD_REQUEST | 잘못된 요청 형식 |
| 401 | UNAUTHORIZED | 인증 필요 (향후 구현) |
| 403 | FORBIDDEN | 접근 거부 (향후 구현) |
| 404 | NOT_FOUND | 리소스를 찾을 수 없음 |
| 409 | CONFLICT | 리소스 충돌 (중복 등) |
| 422 | UNPROCESSABLE_ENTITY | 검증 실패 |

**검증 실패 응답 예시 (422)**

```json
{
  "error": {
    "message": "입력 데이터가 유효하지 않습니다",
    "code": "VALIDATION_ERROR",
    "details": {
      "name": ["이름은 필수입니다", "이름은 255자를 초과할 수 없습니다"],
      "email": ["유효한 이메일 주소를 입력하세요"]
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 5xx 서버 에러

| 코드 | 메시지 | 설명 |
|------|--------|------|
| 500 | INTERNAL_SERVER_ERROR | 서버 내부 오류 |
| 502 | BAD_GATEWAY | 게이트웨이 오류 |
| 503 | SERVICE_UNAVAILABLE | 데이터베이스 연결 실패 등 서비스 이용 불가 |
| 504 | GATEWAY_TIMEOUT | 요청 시간 초과 |

**503 Service Unavailable 상세**

데이터베이스 연결 실패 시 다음과 같은 응답을 반환합니다:

```json
{
  "status": "DEGRADED",
  "database": "DOWN",
  "message": "PostgreSQL 데이터베이스에 연결할 수 없습니다. Docker 컨테이너가 실행 중인지 확인하세요.",
  "hint": "실행 명령: docker-compose up -d 또는 .\\scripts\\01-env-setup.ps1"
}
```

프론트엔드에서는 사용자에게 다음과 같은 메시지를 표시합니다:
```
서비스 이용 불가
데이터베이스 연결에 실패했습니다. PostgreSQL이 실행 중인지 확인해주세요.
```

### 비즈니스 에러 코드

| 코드 | 설명 |
|------|------|
| PROJECT_NOT_FOUND | 프로젝트를 찾을 수 없음 |
| TABLE_NOT_FOUND | 테이블을 찾을 수 없음 |
| COLUMN_NOT_FOUND | 컬럼을 찾을 수 없음 |
| INDEX_NOT_FOUND | 인덱스를 찾을 수 없음 |
| DUPLICATE_NAME | 중복된 이름 |
| NAMING_RULE_VIOLATION | 네이밍 규칙 위반 |
| INVALID_DATA_TYPE | 유효하지 않은 데이터 타입 |
| MISSING_PRIMARY_KEY | 기본키 누락 |
| INVALID_RELATIONSHIP | 유효하지 않은 관계 |
| EXPORT_FAILED | 내보내기 실패 |

## 예제

### cURL 예제

```bash
# 프로젝트 생성
curl -X POST http://localhost:8080/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트 프로젝트",
    "description": "API 테스트용 프로젝트"
  }'

# 테이블 생성
curl -X POST http://localhost:8080/api/projects/{projectId}/tables \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User",
    "description": "사용자 테이블"
  }'

# 컬럼 생성
curl -X POST http://localhost:8080/api/tables/{tableId}/columns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "user_id",
    "dataType": "BIGINT",
    "primaryKey": true,
    "identity": true
  }'
```

### JavaScript (Axios) 예제

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// 헬스 체크
const checkHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('시스템 상태:', response.data.status);
    console.log('데이터베이스:', response.data.database);
    return response.data;
  } catch (error) {
    console.error('헬스 체크 실패:', error.response?.data);
    throw error;
  }
};

// 프로젝트 생성
const createProject = async () => {
  const response = await axios.post(`${API_BASE_URL}/projects`, {
    name: '테스트 프로젝트',
    description: 'API 테스트용 프로젝트'
  });
  return response.data;
};

// 테이블 생성
const createTable = async (projectId) => {
  const response = await axios.post(
    `${API_BASE_URL}/projects/${projectId}/tables`,
    {
      name: 'User',
      description: '사용자 테이블'
    }
  );
  return response.data;
};

// 컬럼 생성
const createColumn = async (tableId) => {
  const response = await axios.post(
    `${API_BASE_URL}/tables/${tableId}/columns`,
    {
      name: 'user_id',
      dataType: 'BIGINT',
      primaryKey: true,
      identity: true
    }
  );
  return response.data;
};
```

## 변경 이력

### v1.0.0 (2024-01-01)
- 초기 API 릴리스
- 프로젝트, 테이블, 컬럼, 인덱스 CRUD
- 검증 및 내보내기 기능

---

**API 문서 버전**: 1.0.0  
**최종 업데이트**: 2024-01-01  
**Swagger UI**: http://localhost:8080/api/swagger-ui.html
