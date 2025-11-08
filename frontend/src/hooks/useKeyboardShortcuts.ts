import { useEffect, useCallback } from 'react';

/**
 * 키보드 단축키 정의
 */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description: string;
}

/**
 * 키보드 단축키 훅
 * 
 * @example
 * useKeyboardShortcuts([
 *   { key: 'n', ctrl: true, handler: handleNew, description: '새 프로젝트' },
 *   { key: 's', ctrl: true, handler: handleSave, description: '저장' },
 * ]);
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // 입력 필드에서는 단축키 비활성화
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Ctrl+S, Ctrl+N 등 일부 단축키는 입력 필드에서도 동작
      const allowedInInput = ['s', 'n'].includes(event.key.toLowerCase()) && event.ctrlKey;

      if (isInputField && !allowedInInput) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

/**
 * 전역 키보드 단축키 (Escape)
 */
export function useEscapeKey(handler: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handler();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [handler, enabled]);
}

/**
 * Enter 키 핸들러
 */
export function useEnterKey(handler: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleEnter = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        const target = event.target as HTMLElement;
        // 버튼이나 링크가 아닌 경우에만 처리
        if (target.tagName !== 'BUTTON' && target.tagName !== 'A') {
          handler();
        }
      }
    };

    window.addEventListener('keydown', handleEnter);
    return () => {
      window.removeEventListener('keydown', handleEnter);
    };
  }, [handler, enabled]);
}
