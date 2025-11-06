/**
 * 접근성 유틸리티 함수
 */

/**
 * WCAG AA 색상 대비 검증 (4.5:1)
 * @param foreground 전경색 (hex)
 * @param background 배경색 (hex)
 * @returns 대비율이 4.5:1 이상인지 여부
 */
export function checkColorContrast(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 4.5;
}

/**
 * 두 색상 간의 대비율 계산
 */
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 상대 휘도 계산
 */
function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = rgb.map((val) => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * HEX를 RGB로 변환
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

/**
 * ARIA 라이브 리전 알림
 * 스크린 리더에 동적 콘텐츠 변경 알림
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // 메시지 읽은 후 제거
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * 스크린 리더 전용 텍스트 클래스
 * Tailwind CSS의 sr-only 클래스와 동일
 */
export const srOnlyClass = 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';

/**
 * 포커스 가능한 요소인지 확인
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableSelectors = [
    'a[href]',
    'button:not(:disabled)',
    'input:not(:disabled)',
    'select:not(:disabled)',
    'textarea:not(:disabled)',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return focusableSelectors.some((selector) => element.matches(selector));
}

/**
 * 키보드 전용 포커스 표시
 * 마우스 클릭 시에는 포커스 링 숨김
 */
export function setupKeyboardFocusDetection() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
  });
}

/**
 * ARIA 레이블 생성 헬퍼
 */
export function createAriaLabel(
  action: string,
  target: string,
  context?: string
): string {
  if (context) {
    return `${action} ${target} - ${context}`;
  }
  return `${action} ${target}`;
}

/**
 * 색상 대비 검증 결과
 */
export interface ContrastCheckResult {
  ratio: number;
  passes: boolean;
  level: 'AAA' | 'AA' | 'Fail';
}

/**
 * WCAG 색상 대비 검증 (상세)
 */
export function checkContrastDetailed(
  foreground: string,
  background: string
): ContrastCheckResult {
  const ratio = getContrastRatio(foreground, background);
  
  let level: 'AAA' | 'AA' | 'Fail';
  if (ratio >= 7) {
    level = 'AAA';
  } else if (ratio >= 4.5) {
    level = 'AA';
  } else {
    level = 'Fail';
  }

  return {
    ratio: Math.round(ratio * 100) / 100,
    passes: ratio >= 4.5,
    level,
  };
}

/**
 * 접근성 검증 색상 팔레트
 * Tailwind CSS 색상 중 WCAG AA 준수 조합
 */
export const accessibleColors = {
  // 흰색 배경에 사용 가능한 텍스트 색상
  onWhite: {
    primary: '#2563eb', // blue-600
    success: '#16a34a', // green-600
    warning: '#ca8a04', // yellow-600
    error: '#dc2626', // red-600
    info: '#0284c7', // sky-600
    muted: '#64748b', // slate-500
  },
  // 어두운 배경에 사용 가능한 텍스트 색상
  onDark: {
    primary: '#93c5fd', // blue-300
    success: '#86efac', // green-300
    warning: '#fde047', // yellow-300
    error: '#fca5a5', // red-300
    info: '#7dd3fc', // sky-300
    muted: '#cbd5e1', // slate-300
  },
};
