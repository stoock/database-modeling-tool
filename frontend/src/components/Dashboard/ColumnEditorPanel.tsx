import React from 'react';
import { ColumnManager } from '../ColumnEditor';
import type { Table } from '../../types';

interface ColumnEditorPanelProps {
  selectedTable: Table | null;
  className?: string;
}

/**
 * 컬럼 에디터 패널 컴포넌트
 * - 선택된 테이블의 컬럼 관리 인터페이스
 * - 컬럼 추가, 편집, 삭제, 순서 변경 기능
 * - 실시간 검증 및 키보드 단축키 지원
 */
const ColumnEditorPanel: React.FC<ColumnEditorPanelProps> = ({
  selectedTable,
  className = ''
}) => {
  return (
    <div className={`${className}`}>
      <ColumnManager table={selectedTable} />
    </div>
  );
};

export default ColumnEditorPanel;