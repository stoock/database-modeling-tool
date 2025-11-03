# Implementation Plan

- [x] 1. 프로젝트 초기 설정 및 기본 구조 ✅
  - Vite + React 19 + TypeScript 프로젝트 생성
  - Tailwind CSS 설치 및 설정
  - 필요한 의존성 설치 (zustand, axios, react-router-dom)
  - 디렉토리 구조 생성 (components, pages, services, stores, types)
  - 환경 변수 설정 (.env 파일)
  - _Requirements: 7.1, 8.4_

- [x] 2. TypeScript 타입 정의 작성 ✅
  - types/project.ts: Project, ProjectSummary, NamingRules 타입
  - types/table.ts: Table, TableSummary 타입
  - types/column.ts: Column, MSSQLDataType 타입
  - types/index.ts: Index, IndexColumn 타입
  - types/api.ts: ApiResponse, 요청/응답 타입
  - _Requirements: 8.5_

- [x] 3. API 클라이언트 및 서비스 구현 ✅
- [x] 3.1 API 클라이언트 기본 설정
  - services/api.ts: Axios 인스턴스 생성 및 인터셉터 설정
  - 요청/응답 인터셉터로 로딩 상태 및 에러 처리
  - _Requirements: 8.4_

- [x] 3.2 프로젝트 서비스 구현
  - services/projectService.ts: getAll, getById, create, update, delete 함수
  - _Requirements: 1.1, 1.3, 1.4_

- [x] 3.3 테이블 서비스 구현
  - services/tableService.ts: getByProjectId, getById, create, update, delete 함수
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [x] 3.4 컬럼 서비스 구현
  - services/columnService.ts: getByTableId, create, update, delete 함수
  - _Requirements: 3.4, 3.7_

- [x] 3.5 인덱스 서비스 구현
  - services/indexService.ts: getByTableId, create, delete 함수
  - _Requirements: 4.4, 4.5_

- [x] 3.6 내보내기 서비스 구현
  - services/exportService.ts: preview, download 함수
  - _Requirements: 5.2, 5.3_

- [x] 3.7 검증 서비스 구현
  - services/validationService.ts: validateName, validateProject 함수
  - _Requirements: 6.1, 6.5_

- [x] 4. Zustand 스토어 구현 ✅
- [x] 4.1 프로젝트 스토어
  - stores/projectStore.ts: 프로젝트 목록, 현재 프로젝트, CRUD 액션
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 4.2 테이블 스토어
  - stores/tableStore.ts: 테이블 목록, 현재 테이블, 컬럼/인덱스 관리 액션
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 4.3 UI 스토어
  - stores/uiStore.ts: 모달 상태 관리, 로딩 상태
  - _Requirements: 8.1, 8.2_

- [x] 5. 공통 컴포넌트 구현 ✅
- [x] 5.1 Button 컴포넌트
  - components/common/Button.tsx: variant, size, loading 상태 지원
  - Tailwind CSS 스타일링
  - _Requirements: 7.1_

- [x] 5.2 Input 컴포넌트
  - components/common/Input.tsx: label, error, validation 지원
  - _Requirements: 7.1_

- [x] 5.3 Modal 컴포넌트
  - components/common/Modal.tsx: 제목, 내용, 푸터 영역
  - ESC 키 및 배경 클릭으로 닫기
  - _Requirements: 7.1_

- [ ] 5.4 Table 컴포넌트
  - components/common/Table.tsx: 제네릭 테이블 컴포넌트
  - 컬럼 정의, 행 클릭 이벤트, 로딩 상태
  - _Requirements: 7.1_

- [x] 5.5 LoadingSpinner 컴포넌트
  - components/common/LoadingSpinner.tsx: 로딩 인디케이터
  - _Requirements: 7.3_

- [x] 5.6 ErrorMessage 컴포넌트
  - components/common/ErrorMessage.tsx: 에러 메시지 표시
  - _Requirements: 7.4_

- [ ] 6. 프로젝트 관련 컴포넌트 및 페이지
- [ ] 6.1 ProjectList 컴포넌트
  - components/project/ProjectList.tsx: 프로젝트 카드 목록
  - 각 카드에 이름, 설명, 테이블 수, 생성일 표시
  - _Requirements: 1.1_

- [ ] 6.2 ProjectForm 컴포넌트
  - components/project/ProjectForm.tsx: 프로젝트 생성/수정 폼
  - 이름, 설명 입력 필드
  - _Requirements: 1.2, 1.3_

- [x] 6.3 ProjectListPage (기본 구현 완료)
  - pages/ProjectListPage.tsx: 프로젝트 목록 페이지
  - 프로젝트 카드 목록 직접 렌더링
  - "새 프로젝트" 버튼 (모달 연동 예정)
  - _Requirements: 1.1, 1.2_

- [ ] 6.4 ProjectDetailPage
  - pages/ProjectDetailPage.tsx: 프로젝트 상세 페이지
  - 프로젝트 정보 표시 및 테이블 목록
  - _Requirements: 1.5_

- [ ] 7. 테이블 관련 컴포넌트
- [ ] 7.1 TableList 컴포넌트
  - components/table/TableList.tsx: 테이블 목록 테이블
  - 테이블명, 설명, 컬럼 수, 인덱스 수, 작업 버튼
  - _Requirements: 2.1_

- [ ] 7.2 TableForm 컴포넌트
  - components/table/TableForm.tsx: 테이블 생성/수정 폼
  - 이름, 설명 입력 필드
  - 네이밍 규칙 실시간 검증 통합
  - _Requirements: 2.1, 2.2_

- [ ] 8. 컬럼 관련 컴포넌트
- [ ] 8.1 ColumnList 컴포넌트
  - components/column/ColumnList.tsx: 컬럼 목록 테이블
  - 순서, 컬럼명, 데이터 타입, NULL 허용, 기본값, 작업 버튼
  - _Requirements: 3.1_

- [ ] 8.2 DataTypeSelector 컴포넌트
  - components/column/DataTypeSelector.tsx: MSSQL 데이터 타입 선택
  - 그룹화된 드롭다운 (문자열, 숫자, 날짜/시간, 기타)
  - 타입별 추가 옵션 표시 (길이, 정밀도, 스케일)
  - _Requirements: 3.3_

- [ ] 8.3 ColumnForm 컴포넌트
  - components/column/ColumnForm.tsx: 컬럼 생성/수정 폼
  - 컬럼명, 데이터 타입, 길이/정밀도, NULL 허용, 기본값, 설명 입력
  - DataTypeSelector 컴포넌트 사용
  - 네이밍 규칙 실시간 검증 통합
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7_

- [ ] 9. 인덱스 관련 컴포넌트
- [ ] 9.1 IndexList 컴포넌트
  - components/index/IndexList.tsx: 인덱스 목록 테이블
  - 인덱스명, 타입, UNIQUE, 컬럼, 작업 버튼
  - _Requirements: 4.1_

- [ ] 9.2 IndexForm 컴포넌트
  - components/index/IndexForm.tsx: 인덱스 생성 폼
  - 인덱스명, 타입(라디오), UNIQUE(체크박스), 컬럼 선택(다중)
  - _Requirements: 4.2, 4.3, 4.4_

- [ ] 10. 테이블 상세 페이지
- [ ] 10.1 TableDetailPage 구현
  - pages/TableDetailPage.tsx: 테이블 상세 페이지
  - 탭 UI: 컬럼 탭, 인덱스 탭
  - ColumnList, IndexList 컴포넌트 사용
  - "컬럼 추가", "인덱스 추가" 버튼
  - _Requirements: 2.4, 4.1_

- [ ] 11. 내보내기 기능
- [ ] 11.1 ExportDialog 컴포넌트
  - components/export/ExportDialog.tsx: 내보내기 옵션 모달
  - 형식 선택 (SQL, Markdown, HTML, JSON, CSV)
  - 검증 포함 옵션
  - 미리보기/다운로드 버튼
  - _Requirements: 5.1, 5.4, 5.5_

- [ ] 11.2 SqlPreview 컴포넌트
  - components/export/SqlPreview.tsx: SQL 스크립트 미리보기
  - 코드 하이라이팅 (선택사항)
  - 복사 버튼
  - _Requirements: 5.2_

- [ ] 12. 네이밍 규칙 검증 통합
- [ ] 12.1 useValidation 커스텀 훅
  - hooks/useValidation.ts: 네이밍 규칙 검증 로직
  - 디바운스 적용
  - _Requirements: 6.1_

- [ ] 12.2 ValidationFeedback 컴포넌트
  - components/common/ValidationFeedback.tsx: 검증 결과 표시
  - 오류 메시지 (빨간색), 성공 표시 (초록색)
  - 제안 사항 표시 및 적용 버튼
  - _Requirements: 6.2, 6.3, 6.4_

- [ ] 12.3 프로젝트 전체 검증 기능
  - ProjectDetailPage에 "전체 검증" 버튼 추가
  - 검증 결과 모달 표시
  - _Requirements: 6.5_

- [ ] 13. 라우팅 설정
  - App.tsx: React Router 설정
  - 라우트: /, /projects/:projectId, /projects/:projectId/tables/:tableId
  - 404 페이지
  - _Requirements: 7.1_

- [ ] 14. 반응형 디자인 적용
  - 모든 페이지와 컴포넌트에 Tailwind 반응형 클래스 적용
  - 모바일, 태블릿, 데스크톱 레이아웃 테스트
  - _Requirements: 7.2_

- [ ] 15. 에러 처리 및 로딩 상태
  - API 에러 처리 로직 완성
  - 로딩 상태 표시 (LoadingSpinner)
  - 에러 메시지 표시 (ErrorMessage)
  - _Requirements: 7.3, 7.4_

- [ ] 16. 최종 통합 및 테스트
  - 전체 플로우 테스트: 프로젝트 생성 → 테이블 추가 → 컬럼 추가 → 인덱스 추가 → 스키마 내보내기
  - 네이밍 규칙 검증 플로우 테스트
  - 반응형 디자인 테스트
  - 에러 시나리오 테스트
  - _Requirements: 1.1-8.5_
