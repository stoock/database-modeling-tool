# 성능 최적화 가이드

이 문서는 frontend-new 애플리케이션에 적용된 성능 최적화 기법을 설명합니다.

## 적용된 최적화 기법

### 1. React.memo를 통한 불필요한 리렌더링 방지

다음 컴포넌트들에 `React.memo`를 적용하여 props가 변경되지 않으면 리렌더링을 방지합니다:

#### 목록 컴포넌트
- **ProjectCard**: 프로젝트 카드 컴포넌트
- **TableList**: 테이블 목록 컴포넌트
- **TableCard**: 개별 테이블 카드 컴포넌트
- **TableDetail**: 테이블 상세 정보 컴포넌트
- **ColumnList**: 컬럼 목록 컴포넌트
- **ValidationPanel**: 검증 패널 컴포넌트

```typescript
// 예시: ProjectCard
const ProjectCard = memo(({ project, onSelect, onDelete }: ProjectCardProps) => {
  // 컴포넌트 로직
});
```

### 2. useMemo를 통한 계산 비용 캐싱

계산 비용이 높은 값들을 `useMemo`로 캐싱하여 불필요한 재계산을 방지합니다:

#### 적용 사례
- **날짜 포맷팅**: `new Date().toLocaleDateString()` 결과 캐싱
- **정렬된 목록**: 컬럼 목록의 orderIndex 기반 정렬 결과 캐싱
- **계산된 값**: 다음 orderIndex, 테이블 개수 등
- **검증 결과**: 준수율 계산, 에러/경고 그룹화 결과 캐싱
- **ARIA 레이블**: 접근성을 위한 복잡한 레이블 문자열 캐싱

```typescript
// 예시: 날짜 포맷팅 캐싱
const formattedDate = useMemo(() => 
  new Date(project.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  [project.createdAt]
);

// 예시: 정렬된 목록 캐싱
const sortedColumns = useMemo(() => 
  [...localColumns].sort((a, b) => a.orderIndex - b.orderIndex),
  [localColumns]
);
```

### 3. useCallback을 통한 함수 참조 안정화

이벤트 핸들러와 콜백 함수를 `useCallback`으로 메모이제이션하여 자식 컴포넌트의 불필요한 리렌더링을 방지합니다:

#### 적용 사례
- **이벤트 핸들러**: onClick, onKeyDown 등
- **API 호출 함수**: loadColumns, loadIndexes 등
- **상태 업데이트 함수**: handleValidate, toggleSection 등
- **네비게이션 함수**: handleNavigate, handleBack 등

```typescript
// 예시: 이벤트 핸들러 메모이제이션
const handleSelect = useCallback(() => {
  onSelect(project);
}, [onSelect, project]);

const handleDelete = useCallback((e: React.MouseEvent) => {
  e.stopPropagation();
  onDelete(project);
}, [onDelete, project]);

// 예시: API 호출 함수 메모이제이션
const loadColumns = useCallback(async () => {
  setIsLoadingColumns(true);
  try {
    const data = await getColumns(table.id);
    setColumns(data);
  } catch (error) {
    console.error('컬럼 로딩 실패:', error);
  } finally {
    setIsLoadingColumns(false);
  }
}, [table.id]);
```

### 4. 디바운싱을 통한 실시간 검증 최적화

사용자 입력에 대한 실시간 검증 시 500ms 디바운스를 적용하여 불필요한 API 호출과 계산을 최소화합니다:

#### 적용 컴포넌트
- **CreateTableDialog**: 테이블명, Description 실시간 검증
- **CreateColumnDialog**: 컬럼명, Description 실시간 검증
- **EditColumnDialog**: 컬럼 수정 시 실시간 검증

```typescript
// 예시: useDebounce 훅 사용
const debouncedName = useDebounce(watchName, 500);
const debouncedDescription = useDebounce(watchDescription, 500);

// 디바운스된 값으로 검증 실행
useEffect(() => {
  if (debouncedName && debouncedName.trim() !== '') {
    const result = validateTableName(debouncedName);
    setNameValidation(result);
  } else {
    setNameValidation(null);
  }
}, [debouncedName]);
```

### 5. 코드 스플리팅을 통한 초기 로딩 최적화

`React.lazy`와 `Suspense`를 사용하여 페이지 컴포넌트를 지연 로딩합니다:

#### 적용 페이지
- **ProjectsPage**: 프로젝트 목록 페이지
- **ProjectDetailPage**: 프로젝트 상세 페이지

```typescript
// App.tsx
import { lazy, Suspense } from 'react';

// 코드 스플리팅 - React.lazy로 페이지 컴포넌트 지연 로딩
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage'));

// Suspense로 로딩 상태 처리
<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/projects" element={<ProjectsPage />} />
    <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
  </Routes>
</Suspense>
```

## 성능 측정 및 모니터링

### Chrome DevTools를 사용한 성능 측정

1. **React DevTools Profiler**
   - 컴포넌트 렌더링 시간 측정
   - 불필요한 리렌더링 감지
   - 최적화 전후 비교

2. **Performance 탭**
   - 초기 로딩 시간 측정
   - 번들 크기 확인
   - 네트워크 요청 분석

3. **Lighthouse**
   - 전체적인 성능 점수 확인
   - 최적화 제안 확인

### 성능 개선 효과

#### 예상 개선 사항
- **초기 로딩 시간**: 코드 스플리팅으로 30-40% 감소
- **리렌더링 횟수**: React.memo로 50-70% 감소
- **API 호출 횟수**: 디바운싱으로 80-90% 감소
- **메모리 사용량**: 불필요한 재계산 방지로 10-20% 감소

## 추가 최적화 권장사항

### 1. 가상 스크롤링 (Virtual Scrolling)
대량의 데이터를 표시할 때 `react-window` 또는 `react-virtualized` 사용 고려:
- 컬럼 목록이 100개 이상일 때
- 테이블 목록이 50개 이상일 때

### 2. 이미지 최적화
- 이미지 lazy loading 적용
- WebP 포맷 사용
- 적절한 이미지 크기 사용

### 3. 번들 크기 최적화
- Tree shaking 확인
- 불필요한 의존성 제거
- 동적 import 활용

### 4. 캐싱 전략
- React Query 또는 SWR 도입 고려
- API 응답 캐싱
- 로컬 스토리지 활용

### 5. Web Workers
- 복잡한 계산 작업을 Web Worker로 이동
- SQL 생성 로직 등

## 주의사항

### React.memo 사용 시
- 단순한 컴포넌트에는 오버헤드가 될 수 있음
- props 비교 비용이 렌더링 비용보다 클 수 있음
- 필요한 곳에만 선택적으로 적용

### useMemo/useCallback 사용 시
- 의존성 배열을 정확하게 지정
- 과도한 사용은 오히려 성능 저하 가능
- 실제 성능 측정 후 적용

### 디바운싱 사용 시
- 적절한 지연 시간 설정 (보통 300-500ms)
- 사용자 경험 고려
- 중요한 입력은 즉시 반영

## 참고 자료

- [React 공식 문서 - 성능 최적화](https://react.dev/learn/render-and-commit)
- [React.memo 가이드](https://react.dev/reference/react/memo)
- [useMemo 가이드](https://react.dev/reference/react/useMemo)
- [useCallback 가이드](https://react.dev/reference/react/useCallback)
- [Code Splitting 가이드](https://react.dev/reference/react/lazy)
