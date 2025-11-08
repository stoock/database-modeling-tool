# API 클라이언트

Axios 기반 API 클라이언트로 백엔드와 통신합니다.

## 설정

```typescript
// lib/api.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## 인터셉터

### 요청 인터셉터
- 요청 로깅
- 인증 토큰 추가 (향후)

### 응답 인터셉터
- 성공 응답 처리
- 에러 응답 자동 처리
- 토스트 메시지 표시

## 주요 API 함수

### 프로젝트
```typescript
getProjects(): Promise<Project[]>
getProjectById(id: string): Promise<Project>
createProject(data: CreateProjectRequest): Promise<Project>
updateProject(id: string, data: UpdateProjectRequest): Promise<Project>
deleteProject(id: string): Promise<void>
```

### 테이블
```typescript
getTables(projectId: string): Promise<Table[]>
getTableById(id: string): Promise<Table>
createTable(projectId: string, data: CreateTableRequest): Promise<Table>
updateTable(id: string, data: UpdateTableRequest): Promise<Table>
deleteTable(id: string): Promise<void>
```

### 컬럼
```typescript
getColumns(tableId: string): Promise<Column[]>
getColumnById(id: string): Promise<Column>
createColumn(tableId: string, data: CreateColumnRequest): Promise<Column>
updateColumn(id: string, data: UpdateColumnRequest): Promise<Column>
deleteColumn(id: string): Promise<void>
reorderColumns(tableId: string, data: ReorderColumnsRequest): Promise<void>
```

### 인덱스
```typescript
getIndexes(tableId: string): Promise<Index[]>
createIndex(tableId: string, data: CreateIndexRequest): Promise<Index>
deleteIndex(id: string): Promise<void>
```

### 검증
```typescript
validateProject(projectId: string): Promise<ValidationResult>
```

### 내보내기
```typescript
exportToSql(projectId: string, options: ExportOptions): Promise<ExportResult>
```

## 에러 처리

API 에러는 자동으로 토스트로 표시됩니다.

```typescript
// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message || '오류가 발생했습니다';
    useToastStore.getState().error('API 오류', message);
    return Promise.reject(error);
  }
);
```

## 사용 예시

```typescript
import { getProjects, createProject } from '@/lib/api';

async function loadProjects() {
  try {
    const projects = await getProjects();
    console.log(projects);
  } catch (error) {
    // 에러는 자동으로 토스트로 표시됨
  }
}

async function addProject(data: CreateProjectRequest) {
  try {
    const project = await createProject(data);
    return project;
  } catch (error) {
    throw error;
  }
}
```

## 타입 안정성

모든 API 함수는 TypeScript 타입을 사용하여 타입 안정성을 보장합니다.

```typescript
interface CreateProjectRequest {
  name: string;
  description: string;
  namingRules: NamingRules;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}
```
