import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  description?: string;
}

/**
 * 키보드 단축키를 등록하는 훅
 */
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const {
          key,
          ctrlKey = false,
          shiftKey = false,
          altKey = false,
          callback,
        } = shortcut;

        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          event.ctrlKey === ctrlKey &&
          event.shiftKey === shiftKey &&
          event.altKey === altKey
        ) {
          event.preventDefault();
          callback();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

// 일반적인 단축키들
export const commonShortcuts = {
  save: { key: 's', ctrlKey: true, description: 'Ctrl+S: 저장' },
  undo: { key: 'z', ctrlKey: true, description: 'Ctrl+Z: 실행 취소' },
  redo: { key: 'y', ctrlKey: true, description: 'Ctrl+Y: 다시 실행' },
  copy: { key: 'c', ctrlKey: true, description: 'Ctrl+C: 복사' },
  paste: { key: 'v', ctrlKey: true, description: 'Ctrl+V: 붙여넣기' },
  delete: { key: 'Delete', description: 'Delete: 삭제' },
  escape: { key: 'Escape', description: 'Esc: 취소' },
  enter: { key: 'Enter', description: 'Enter: 확인' },
};

export default useKeyboardShortcuts;