# 상태 관리

Zustand를 사용하여 전역 상태를 관리합니다.

## projectStore

프로젝트 관련 상태와 CRUD 액션을 관리합니다.

### 상태
```typescript
{
  projects: Project[]
  selectedProject: Project | null
  isLoading: boolean
  error: string | null
}
```

### 액션
- `fetchProjects()`: 모든 프로젝트 조회
- `fetchProjectById(id)`: 특정 프로젝트 조회
- `createProject(data)`: 프로젝트 생성
- `updateProject(id, data)`: 프로젝트 수정
- `deleteProject(id)`: 프로젝트 삭제
- `setSelectedProject(project)`: 프로젝트 선택
- `clearError()`: 에러 초기화
- `reset()`: 스토어 초기화

### 사용 예시
```typescript
import { useProjectStore } from '@/stores';

function ProjectList() {
  const { projects, isLoading, fetchProjects } = useProjectStore();
  
  useEffect(() => {
    fetchProjects();
  }, []);
  
  return (
    // JSX
  );
}
```

## tableStore

테이블 관련 상태와 CRUD 액션을 관리합니다.

### 상태
```typescript
{
  tables: Table[]
  selectedTable: Table | null
  isLoading: boolean
  error: string | null
}
```

### 액션
- `fetchTablesByProject(projectId)`: 프로젝트의 모든 테이블 조회
- `fetchTableById(id)`: 특정 테이블 조회
- `createTable(data)`: 테이블 생성
- `updateTable(id, data)`: 테이블 수정
- `deleteTable(id)`: 테이블 삭제
- `setSelectedTable(table)`: 테이블 선택
- `clearError()`: 에러 초기화
- `reset()`: 스토어 초기화

## toastStore

토스트 메시지를 관리합니다.

### 상태
```typescript
{
  toasts: Toast[]
}
```

### 액션
- `addToast(toast)`: 토스트 추가
- `removeToast(id)`: 토스트 제거
- `clearAll()`: 모든 토스트 제거
- `success(title, description)`: 성공 토스트
- `error(title, description)`: 에러 토스트
- `warning(title, description)`: 경고 토스트
- `info(title, description)`: 정보 토스트

### 사용 예시
```typescript
import { useToastStore } from '@/stores';

function MyComponent() {
  const { success, error } = useToastStore();
  
  const handleSave = async () => {
    try {
      await saveData();
      success('저장 완료', '데이터가 성공적으로 저장되었습니다');
    } catch (err) {
      error('저장 실패', '데이터 저장 중 오류가 발생했습니다');
    }
  };
}
```

## 스토어 간 의존성

프로젝트가 선택되거나 삭제될 때 테이블 스토어가 자동으로 초기화됩니다.

```typescript
// projectStore.ts
setSelectedProject: (project) => {
  set({ selectedProject: project });
  if (project) {
    useTableStore.getState().reset();
  }
}
```

## 성능 최적화

### 선택적 구독
```typescript
// 비효율적
const store = useProjectStore();

// 효율적
const projects = useProjectStore((state) => state.projects);
const isLoading = useProjectStore((state) => state.isLoading);
```

### 액션만 사용
```typescript
const createProject = useProjectStore((state) => state.createProject);
```
