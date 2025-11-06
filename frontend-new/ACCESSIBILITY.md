# 접근성 가이드

이 문서는 MSSQL 데이터베이스 모델링 도구의 접근성 기능과 WCAG 2.1 AA 준수 사항을 설명합니다.

## 목차
- [키보드 네비게이션](#키보드-네비게이션)
- [스크린 리더 지원](#스크린-리더-지원)
- [색상 대비](#색상-대비)
- [포커스 관리](#포커스-관리)
- [ARIA 레이블](#aria-레이블)
- [테스트 방법](#테스트-방법)

## 키보드 네비게이션

### 전역 단축키

| 단축키 | 기능 | 페이지 |
|--------|------|--------|
| `Ctrl + N` | 새 프로젝트 생성 | 프로젝트 목록 |
| `Ctrl + E` | 스키마 내보내기 | 프로젝트 상세 |
| `Esc` | 다이얼로그 닫기 / 이전 페이지 | 모든 페이지 |
| `Tab` | 다음 요소로 이동 | 모든 페이지 |
| `Shift + Tab` | 이전 요소로 이동 | 모든 페이지 |
| `Enter` | 선택/실행 | 모든 페이지 |
| `Space` | 체크박스/버튼 토글 | 모든 페이지 |

### 다이얼로그 내 키보드 동작

- **Tab**: 다이얼로그 내 포커스 가능한 요소 간 순환
- **Esc**: 다이얼로그 닫기
- **Enter**: 폼 제출 (입력 필드에서)

### 리스트 네비게이션

- **화살표 위/아래**: 리스트 항목 간 이동 (구현 예정)
- **Home**: 첫 번째 항목으로 이동 (구현 예정)
- **End**: 마지막 항목으로 이동 (구현 예정)

## 스크린 리더 지원

### ARIA 라이브 리전

애플리케이션은 동적 콘텐츠 변경을 스크린 리더에 알립니다:

- **성공 메시지**: `aria-live="polite"`
- **에러 메시지**: `aria-live="assertive"`
- **로딩 상태**: `role="status"`

### 스크린 리더 전용 텍스트

중요한 정보는 시각적으로 숨겨져 있지만 스크린 리더에서 읽힙니다:

```html
<p class="sr-only">
  Ctrl+N을 눌러 새 프로젝트를 생성할 수 있습니다
</p>
```

### 의미 있는 HTML 구조

- `<header>`: 페이지 헤더
- `<main>`: 주요 콘텐츠
- `<nav>`: 네비게이션
- `<aside>`: 사이드바
- `<article>`: 독립적인 콘텐츠
- `<section>`: 콘텐츠 섹션

## 색상 대비

### WCAG AA 준수 색상 팔레트

모든 텍스트와 배경 색상 조합은 WCAG AA 기준(4.5:1)을 충족합니다:

#### 밝은 배경 (흰색)
- **Primary**: `#2563eb` (blue-600) - 대비율 7.5:1
- **Success**: `#16a34a` (green-600) - 대비율 4.8:1
- **Warning**: `#ca8a04` (yellow-600) - 대비율 4.6:1
- **Error**: `#dc2626` (red-600) - 대비율 5.9:1
- **Muted**: `#64748b` (slate-500) - 대비율 4.7:1

#### 어두운 배경
- **Primary**: `#93c5fd` (blue-300)
- **Success**: `#86efac` (green-300)
- **Warning**: `#fde047` (yellow-300)
- **Error**: `#fca5a5` (red-300)
- **Muted**: `#cbd5e1` (slate-300)

### 색상 외 정보 전달

색상만으로 정보를 전달하지 않습니다:
- 에러: 빨간색 + 아이콘 + 텍스트
- 성공: 초록색 + 아이콘 + 텍스트
- 경고: 노란색 + 아이콘 + 텍스트

## 포커스 관리

### 포커스 표시

- **키보드 네비게이션**: 2px 파란색 아웃라인
- **마우스 클릭**: 아웃라인 숨김 (사용자 경험 개선)

### 포커스 트랩

다이얼로그가 열리면 포커스가 다이얼로그 내부에 갇힙니다:
1. 다이얼로그가 열리면 첫 번째 입력 필드에 자동 포커스
2. Tab 키로 다이얼로그 내 요소만 순환
3. 다이얼로그가 닫히면 이전 포커스 위치로 복원

### 자동 포커스

- 다이얼로그 열림: 첫 번째 입력 필드
- 에러 발생: 에러가 있는 첫 번째 필드
- 페이지 로드: 메인 콘텐츠 영역

## ARIA 레이블

### 버튼

모든 버튼에는 명확한 레이블이 있습니다:

```tsx
<Button aria-label="새 프로젝트 생성 (단축키: Ctrl+N)">
  <Plus className="h-4 w-4" aria-hidden="true" />
  새 프로젝트
</Button>
```

### 폼 필드

모든 입력 필드는 레이블과 연결되어 있습니다:

```tsx
<Label htmlFor="name">
  프로젝트명 <span className="text-red-500" aria-label="필수">*</span>
</Label>
<Input
  id="name"
  aria-required="true"
  aria-invalid={errors.name ? 'true' : 'false'}
  aria-describedby={errors.name ? 'name-error' : undefined}
/>
{errors.name && (
  <p id="name-error" role="alert">
    {errors.name.message}
  </p>
)}
```

### 다이얼로그

```tsx
<DialogContent
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <DialogTitle id="dialog-title">제목</DialogTitle>
  <DialogDescription id="dialog-description">설명</DialogDescription>
</DialogContent>
```

### 리스트

```tsx
<div role="list" aria-label="프로젝트 목록 (총 5개)">
  <Card role="listitem" tabIndex={0}>
    {/* 카드 내용 */}
  </Card>
</div>
```

## 반응형 디자인

### 터치 타겟 크기

모든 인터랙티브 요소는 최소 44x44px 크기를 유지합니다:
- 버튼
- 링크
- 체크박스
- 라디오 버튼

### 모바일 접근성

- 확대/축소 가능
- 가로/세로 모드 지원
- 터치 제스처 지원

## 애니메이션 감소

사용자가 애니메이션 감소를 선호하는 경우 자동으로 적용됩니다:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 고대비 모드

고대비 모드를 선호하는 사용자를 위한 스타일:

```css
@media (prefers-contrast: high) {
  * {
    border-color: currentColor !important;
  }
  
  button, input, select, textarea {
    border-width: 2px !important;
  }
}
```

## 테스트 방법

### 키보드 네비게이션 테스트

1. 마우스를 사용하지 않고 Tab 키만으로 모든 기능 접근
2. Enter/Space 키로 모든 버튼 실행
3. Esc 키로 다이얼로그 닫기
4. 단축키 동작 확인

### 스크린 리더 테스트

**Windows (NVDA)**:
```bash
# NVDA 다운로드: https://www.nvaccess.org/
# Ctrl + Alt + N: NVDA 시작
# Insert + Q: NVDA 종료
```

**macOS (VoiceOver)**:
```bash
# Cmd + F5: VoiceOver 시작/종료
# Ctrl + Option + 화살표: 네비게이션
```

### 색상 대비 테스트

1. Chrome DevTools > Lighthouse > Accessibility 실행
2. 온라인 도구: https://webaim.org/resources/contrastchecker/
3. 브라우저 확장: WAVE, axe DevTools

### 자동화 테스트

```bash
# Playwright 접근성 테스트
npm run test:e2e

# axe-core를 사용한 접근성 검사
npm run test:a11y
```

## 알려진 제한사항

1. **드래그 앤 드롭**: 현재 키보드로 접근 불가 (개선 예정)
2. **복잡한 테이블**: 스크린 리더 최적화 필요
3. **실시간 검증**: 너무 빈번한 알림 (디바운스 적용됨)

## 피드백

접근성 문제를 발견하셨나요? 이슈를 등록해주세요:
- GitHub Issues
- 이메일: accessibility@example.com

## 참고 자료

- [WCAG 2.1 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
