# Implementation Plan

- [x] 1. 프로젝트 초기 설정 및 기본 구조





  - frontend-new 폴더에 Vite + React + TypeScript 프로젝트 생성
  - Tailwind CSS 설정 및 기본 스타일 구성
  - shadcn/ui 초기화 및 기본 컴포넌트 설치 (Button, Input, Select, Dialog, Toast, Card, Tabs)
  - React Router 설정 및 기본 라우트 구성
  - Axios 설정 및 API 클라이언트 기본 구조 작성
  - 환경 변수 설정 (VITE_API_BASE_URL)
  - _Requirements: 7.1, 7.2, 8.1_

- [x] 2. 타입 정의 및 유틸리티




  - TypeScript 타입 정의 작성 (Project, Table, Column, Index, ValidationResult 등)
  - MSSQL 데이터 타입 enum 정의 (27개 타입)
  - 명명 규칙 검증 유틸리티 함수 작성 (대문자 검증, PK 조합 검증, Description 검증)
  - API 응답 타입 정의
  - 공통 유틸리티 함수 작성 (날짜 포맷, 에러 처리 등)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_

- [x] 3. Zustand 상태 관리 스토어




  - projectStore 작성 (프로젝트 목록, 선택된 프로젝트, CRUD 액션)
  - tableStore 작성 (테이블 목록, 선택된 테이블, CRUD 액션)
  - toastStore 작성 (토스트 메시지 관리)
  - 스토어 간 의존성 관리 및 데이터 동기화
  - _Requirements: 8.1, 8.2_

- [x] 4. API 클라이언트 구현





  - Axios 인터셉터 설정 (에러 처리, 토스트 표시)
  - 프로젝트 API 함수 작성 (목록 조회, 생성, 수정, 삭제)
  - 테이블 API 함수 작성 (목록 조회, 생성, 수정, 삭제)
  - 컬럼 API 함수 작성 (생성, 수정, 삭제, 순서 변경)
  - 인덱스 API 함수 작성 (생성, 삭제)
  - 검증 API 함수 작성 (프로젝트 검증, 명명 규칙 검증)
  - 내보내기 API 함수 작성 (SQL 생성)
  - _Requirements: 1.2, 2.5, 3.7, 4.7, 5.11, 6.2_

- [x] 5. 프로젝트 관리 페이지





  - ProjectsPage 컴포넌트 작성 (프로젝트 목록 표시)
  - 프로젝트 카드 컴포넌트 작성 (이름, 설명, 생성일 표시)
  - CreateProjectDialog 컴포넌트 작성 (React Hook Form + Zod 검증)
  - 프로젝트 삭제 확인 다이얼로그 작성
  - 프로젝트 선택 시 상세 페이지로 라우팅
  - 로딩 상태 및 에러 처리
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.3, 7.4_

- [x] 6. 프로젝트 상세 페이지 레이아웃





  - ProjectDetailPage 컴포넌트 작성 (좌우 분할 레이아웃)
  - 좌측 테이블 목록 영역 (30%)
  - 우측 테이블 상세 영역 (70%)
  - 프로젝트 정보 헤더 (이름, 설명, 내보내기 버튼)
  - 반응형 레이아웃 (모바일 대응)
  - _Requirements: 7.8_

- [x] 7. 테이블 목록 컴포넌트





  - TableList 컴포넌트 작성 (테이블 목록 표시)
  - 테이블 선택 하이라이트 기능
  - CreateTableDialog 컴포넌트 작성 (대문자 검증, Description 필수)
  - 테이블 삭제 확인 다이얼로그
  - 실시간 명명 규칙 검증 (500ms 디바운스)
  - Description 테이블명 복사 검증
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 5.11, 5.12, 5.13, 5.14_

- [x] 8. 테이블 상세 탭 구조





  - TableDetail 컴포넌트 작성 (Tabs 사용)
  - 컬럼 탭 구현
  - 인덱스 탭 구현
  - 탭 전환 시 데이터 로딩
  - _Requirements: 2.6_
-

- [x] 9. 컬럼 목록 및 관리




  - ColumnList 컴포넌트 작성 (테이블 형태로 표시)
  - 컬럼 정보 표시 (순서, 이름, Description, 타입, NULL, PK, IDENTITY)
  - 드래그 앤 드롭 순서 변경 기능 (react-beautiful-dnd 또는 dnd-kit)
  - 컬럼 편집/삭제 버튼
  - _Requirements: 3.1, 3.14_
-

- [x] 10. 컬럼 생성 다이얼로그




  - CreateColumnDialog 컴포넌트 작성
  - 기본 필드 (name, description, dataType, nullable, primaryKey)
  - 조건부 필드 (maxLength, precision, scale, identity 관련)
  - 27개 MSSQL 데이터 타입 선택기
  - VARCHAR/NVARCHAR 선택 시 길이 필수 입력
  - DECIMAL/NUMERIC 선택 시 precision, scale 필수 입력
  - 정수형 선택 시 IDENTITY 옵션 표시
  - 대문자 형식 실시간 검증
  - PK 컬럼 테이블명 포함 검증
  - Description 형식 검증 ("한글명 || 상세설명")
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 5.7, 5.8, 5.9_

- [x] 11. 시스템 속성 컬럼 자동 추가




  - 테이블 생성 시 시스템 속성 자동 추가 옵션 체크박스
  - REG_ID, REG_DT, CHG_ID, CHG_DT 컬럼 자동 생성
  - 올바른 데이터 타입 및 제약조건 설정
  - _Requirements: 3.10, 5.10_

- [x] 12. 컬럼 편집 다이얼로그




  - EditColumnDialog 컴포넌트 작성
  - CreateColumnDialog와 동일한 폼 구조
  - 기존 값으로 초기화
  - 수정 후 API 호출 및 목록 갱신
  - _Requirements: 3.8, 3.11, 3.12_
-

- [x] 13. 컬럼 삭제 기능




  - 삭제 확인 다이얼로그
  - API 호출 및 목록 갱신
  - 에러 처리 및 토스트 메시지
  - _Requirements: 3.9, 3.13_

- [x] 14. 인덱스 목록 및 관리




  - IndexList 컴포넌트 작성 (카드 형태로 표시)
  - 인덱스 정보 표시 (이름, 타입, UNIQUE, 컬럼 목록)
  - 인덱스 삭제 버튼
  - _Requirements: 4.1, 4.8_
-

- [x] 15. 인덱스 생성 다이얼로그




  - CreateIndexDialog 컴포넌트 작성
  - 인덱스명, 타입, UNIQUE 옵션 입력
  - 복합 인덱스를 위한 다중 컬럼 선택
  - 각 컬럼의 정렬 순서 선택 (ASC/DESC)
  - 컬럼 순서 드래그 앤 드롭
  - 인덱스명 자동 생성 제안 기능
  - 명명 규칙 검증 (PK__/CIDX__/IDX__ 접두사)
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.7_

- [x] 16. 검증 패널 구현




  - ValidationPanel 컴포넌트 작성
  - 검증 실행 버튼
  - 검증 결과 표시 (에러/경고 그룹화)
  - 총 에러 수, 경고 수, 준수율 표시
  - 각 항목 클릭 시 해당 엔티티로 이동
  - _Requirements: 5.15, 5.16_
-

- [x] 17. 실시간 검증 배지




  - ValidationBadge 컴포넌트 작성
  - Valid/Invalid 상태 표시 (초록색/빨간색)
  - 에러 메시지 및 제안 표시
  - 폼 필드에 통합
  - _Requirements: 5.12, 5.13, 5.14_

- [x] 18. SQL 스키마 내보내기





  - ExportDialog 컴포넌트 작성
  - 내보내기 옵션 선택 (DROP, Comments, Indexes, Constraints)
  - SQL 스크립트 미리보기 (구문 강조)
  - 다운로드 버튼 (.sql 파일)
  - 클립보드 복사 버튼
  - DB 스키마 가이드 준수 확인 (대문자, MS_Description, 시스템 속성, 명명 규칙)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12_
-

- [x] 19. 에러 처리 및 토스트




  - 전역 에러 핸들러 구현
  - Toast 컴포넌트 통합 (shadcn/ui)
  - 성공/에러 메시지 표시
  - 네트워크 에러 처리
  - _Requirements: 7.3, 7.4_

- [x] 20. 접근성 및 키보드 네비게이션




  - ARIA 레이블 추가 (모든 버튼, 폼 필드)
  - 키보드 단축키 구현 (Tab, Enter, Esc)
  - 포커스 관리
  - 색상 대비 확인 (WCAG AA)
  - _Requirements: 7.7, 7.9, 7.10_
-

- [x] 21. 성능 최적화




  - React.memo 적용 (목록 컴포넌트)
  - useMemo/useCallback 적용
  - 디바운싱 적용 (실시간 검증)
  - 코드 스플리팅 (React.lazy)
  - _Requirements: 8.3, 8.4, 8.5, 8.7_

- [x] 22. 테스트 작성




  - 유틸리티 함수 단위 테스트 (Vitest)
  - 주요 컴포넌트 테스트 (React Testing Library)
  - API 클라이언트 테스트 (Mock)
  - _Requirements: All_

- [x] 23. 문서화 및 README
  - frontend-new/README.md 작성
  - 설치 및 실행 방법
  - 프로젝트 구조 설명
  - 주요 기능 설명
  - _Requirements: All_
