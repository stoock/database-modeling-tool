# Zustand 상태 관리 스토어

이 폴더는 애플리케이션의 전역 상태를 관리하는 Zustand 스토어를 포함합니다.

## 스토어 목록

### 1. projectStore
프로젝트 관련 상태와 CRUD 액션을 관리합니다.

**상태:**
- `projects`: 프로젝트 목록
- `selectedProject`: 현재 선택된 프로젝트
- `isLoading`: 로딩 상태
- `error`: 에러 메시지

**액션:**
- `fetchProjects()`: 모든 프로젝트 조회
- `fetchProjectById(id)`: 특정 프로젝트 조회
- `createProject(data)`: 프로젝트 생성
- `updateProject(id, data)`: 프로젝트 수정
- `deleteProject(id)`: 프로젝트 삭제
- `setSelectedProject(project)`: 프로젝트 선택 (테이블 스토어 자동 초기화)
- `clearError()`: 에러 초기화
- `reset()`: 스토어 초기화

**사용 예시:**
```typescript
import { useProjectStore } from '@/stores';

function ProjectList() {
  const { projects, isLoading, fetchProjects, createProject } = useProjectStore();
  
  useEffect(() => {
    fetchProjects();
  }, []);
  
  const handleCreate = async (data) => {
    try {
      await createProject(data);
      // 성공 처리
    } catch (error) {
      // 에러 처리
    }
  };
  
  return (
    // JSX
  );
}
```

### 2. tableStore
테이블 관련 상태와 CRUD 액션을 관리합니다.

**상태:**
- `tables`: 테이블 목록
- `selectedTable`: 현재 선택된 테이블
- `isLoading`: 로딩 상태
- `error`: 에러 메시지

**액션:**
- `fetchTablesByProject(projectId)`: 프로젝트의 모든 테이블 조회
- `fetchTableById(id)`: 특정 테이블 조회
- `createTable(data)`: 테이블 생성
- `updateTable(id, data)`: 테이블 수정
- `deleteTable(id)`: 테이블 삭제
- `setSelectedTable(table)`: 테이블 선택
- `clearError()`: 에러 초기화
- `reset()`: 스토어 초기화

**사용 예시:**
```typescript
import { useTableStore } from '@/stores';

function TableList({ projectId }) {
  const { tables, isLoading, fetchTablesByProject, createTable } = useTableStore();
  
  useEffect(() => {
    if (projectId) {
      fetchTablesByProject(projectId);
    }
  }, [projectId]);
  
  const handleCreate = async (data) => {
    try {
      await createTable({ ...data, projectId });
      // 성공 처리
    } catch (error) {
      // 에러 처리
    }
  };
  
  return (
    // JSX
  );
}
```

### 3. toastStore
토스트 메시지를 관리합니다.

**상태:**
- `toasts`: 현재 표시 중인 토스트 목록

**액션:**
- `addToast(toast)`: 토스트 추가 (자동 제거)
- `removeToast(id)`: 토스트 제거
- `clearAll()`: 모든 토스트 제거
- `success(title, description)`: 성공 토스트 표시
- `error(title, description)`: 에러 토스트 표시
- `warning(title, description)`: 경고 토스트 표시
- `info(title, description)`: 정보 토스트 표시

**사용 예시:**
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
  
  return (
    // JSX
  );
}
```

## 스토어 간 의존성

### projectStore → tableStore
프로젝트가 선택되거나 삭제될 때 테이블 스토어가 자동으로 초기화됩니다.

```typescript
// projectStore.ts
setSelectedProject: (project) => {
  set({ selectedProject: project });
  if (project) {
    useTableStore.getState().reset(); // 테이블 스토어 초기화
  }
}
```

이를 통해 다음과 같은 동작이 보장됩니다:
1. 프로젝트 선택 시 이전 프로젝트의 테이블 데이터가 자동으로 제거됨
2. 프로젝트 삭제 시 관련 테이블 데이터도 함께 정리됨
3. 데이터 일관성 유지

## API 통합

모든 스토어는 `@/lib/api.ts`의 `apiClient`를 사용하여 백엔드 API와 통신합니다.

**에러 처리:**
- API 에러는 axios 인터셉터에서 자동으로 토스트로 표시됩니다
- 각 액션에서 추가적인 에러 처리가 필요한 경우 try-catch로 처리할 수 있습니다

**로딩 상태:**
- 모든 비동기 액션은 자동으로 `isLoading` 상태를 관리합니다
- 컴포넌트에서 로딩 스피너 표시에 활용할 수 있습니다

## 성능 최적화

### 선택적 구독
Zustand는 필요한 상태만 구독할 수 있습니다:

```typescript
// 전체 구독 (비효율적)
const store = useProjectStore();

// 선택적 구독 (효율적)
const projects = useProjectStore((state) => state.projects);
const isLoading = useProjectStore((state) => state.isLoading);
```

### 액션만 사용
상태 변경 없이 액션만 필요한 경우:

```typescript
const createProject = useProjectStore((state) => state.createProject);
```

## 테스트

스토어 테스트는 task 22에서 구현될 예정입니다.
