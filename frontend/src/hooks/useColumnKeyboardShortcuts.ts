import { useEffect, useCallback } from 'react';
import type { Column } from '../types';

interface UseColumnKeyboardShortcutsProps {
  selectedColumn: Column | null;
  columns: Column[];
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
  onDuplicateColumn: (column: Column) => void;
  onAddColumn: () => void;
  onMoveColumn: (columnId: string, direction: 'up' | 'down') => void;
  onSelectColumn: (columnId: string) => void;
  isModalOpen?: boolean;
}

export const useColumnKeyboardShortcuts = ({
  selectedColumn,
  columns,
  onEditColumn,
  onDeleteColumn,
  onDuplicateColumn,
  onAddColumn,
  onMoveColumn,
  onSelectColumn,
  isModalOpen = false,
}: UseColumnKeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 모달이 열려있거나 입력 필드에 포커스가 있으면 단축키 비활성화
    if (isModalOpen || 
        event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement) {
      return;
    }

    const { key, ctrlKey, metaKey, shiftKey } = event;
    const isModifierPressed = ctrlKey || metaKey;

    switch (key) {
      case 'n':
      case 'N':
        if (isModifierPressed) {
          event.preventDefault();
          onAddColumn();
        }
        break;

      case 'e':
      case 'E':
        if (selectedColumn && !isModifierPressed) {
          event.preventDefault();
          onEditColumn(selectedColumn);
        }
        break;

      case 'd':
      case 'D':
        if (selectedColumn && isModifierPressed) {
          event.preventDefault();
          onDuplicateColumn(selectedColumn);
        }
        break;

      case 'Delete':
      case 'Backspace':
        if (selectedColumn && !isModifierPressed) {
          event.preventDefault();
          if (window.confirm(`컬럼 "${selectedColumn.name}"을(를) 삭제하시겠습니까?`)) {
            onDeleteColumn(selectedColumn.id);
          }
        }
        break;

      case 'ArrowUp':
        if (selectedColumn && !isModifierPressed) {
          event.preventDefault();
          if (shiftKey) {
            // Shift + 위 화살표: 컬럼 위로 이동
            onMoveColumn(selectedColumn.id, 'up');
          } else {
            // 위 화살표: 이전 컬럼 선택
            const sortedColumns = [...columns].sort((a, b) => a.orderIndex - b.orderIndex);
            const currentIndex = sortedColumns.findIndex(c => c.id === selectedColumn.id);
            if (currentIndex > 0) {
              onSelectColumn(sortedColumns[currentIndex - 1].id);
            }
          }
        }
        break;

      case 'ArrowDown':
        if (selectedColumn && !isModifierPressed) {
          event.preventDefault();
          if (shiftKey) {
            // Shift + 아래 화살표: 컬럼 아래로 이동
            onMoveColumn(selectedColumn.id, 'down');
          } else {
            // 아래 화살표: 다음 컬럼 선택
            const sortedColumns = [...columns].sort((a, b) => a.orderIndex - b.orderIndex);
            const currentIndex = sortedColumns.findIndex(c => c.id === selectedColumn.id);
            if (currentIndex < sortedColumns.length - 1) {
              onSelectColumn(sortedColumns[currentIndex + 1].id);
            }
          }
        }
        break;

      case 'Home':
        if (columns.length > 0 && !isModifierPressed) {
          event.preventDefault();
          const sortedColumns = [...columns].sort((a, b) => a.orderIndex - b.orderIndex);
          onSelectColumn(sortedColumns[0].id);
        }
        break;

      case 'End':
        if (columns.length > 0 && !isModifierPressed) {
          event.preventDefault();
          const sortedColumns = [...columns].sort((a, b) => a.orderIndex - b.orderIndex);
          onSelectColumn(sortedColumns[sortedColumns.length - 1].id);
        }
        break;

      case 'Escape':
        if (selectedColumn && !isModifierPressed) {
          event.preventDefault();
          onSelectColumn(''); // 선택 해제
        }
        break;
    }
  }, [
    selectedColumn,
    columns,
    onEditColumn,
    onDeleteColumn,
    onDuplicateColumn,
    onAddColumn,
    onMoveColumn,
    onSelectColumn,
    isModalOpen,
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 단축키 도움말 정보 반환
  const shortcuts = [
    { key: 'Ctrl/Cmd + N', description: '새 컬럼 추가' },
    { key: 'E', description: '선택된 컬럼 편집' },
    { key: 'Ctrl/Cmd + D', description: '선택된 컬럼 복사' },
    { key: 'Delete/Backspace', description: '선택된 컬럼 삭제' },
    { key: '↑/↓', description: '컬럼 선택 이동' },
    { key: 'Shift + ↑/↓', description: '컬럼 순서 이동' },
    { key: 'Home/End', description: '첫/마지막 컬럼 선택' },
    { key: 'Escape', description: '선택 해제' },
  ];

  return { shortcuts };
};