import { useEffect, useRef, useCallback } from 'react';

/**
 * 포커스 트랩 훅
 * 모달이나 다이얼로그 내에서 포커스를 가두는 기능
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // 초기 포커스 설정
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * 자동 포커스 훅
 * 컴포넌트가 마운트될 때 특정 요소에 포커스
 */
export function useAutoFocus<T extends HTMLElement>() {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (elementRef.current) {
      // 약간의 지연을 두어 렌더링 완료 후 포커스
      const timer = setTimeout(() => {
        elementRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  return elementRef;
}

/**
 * 포커스 복원 훅
 * 모달이 닫힐 때 이전 포커스 위치로 복원
 */
export function useFocusRestore(isOpen: boolean) {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때 현재 포커스된 요소 저장
      previousActiveElement.current = document.activeElement as HTMLElement;
    } else {
      // 모달이 닫힐 때 이전 포커스 복원
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    }
  }, [isOpen]);
}

/**
 * 포커스 가능한 요소 찾기
 */
export function useFocusableElements(containerRef: React.RefObject<HTMLElement>) {
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const elements = containerRef.current.querySelectorAll<HTMLElement>(
      'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
    );

    return Array.from(elements);
  }, [containerRef]);

  return getFocusableElements;
}

/**
 * 화살표 키 네비게이션 훅
 * 리스트나 그리드에서 화살표 키로 이동
 */
export function useArrowKeyNavigation(
  itemCount: number,
  onSelect: (index: number) => void,
  currentIndex: number
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          newIndex = Math.min(currentIndex + 1, itemCount - 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          newIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          newIndex = itemCount - 1;
          break;
        default:
          return;
      }

      if (newIndex !== currentIndex) {
        onSelect(newIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, itemCount, onSelect]);
}
