import React, { useRef, useEffect } from 'react';
import { 
  PencilIcon,
  TrashIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import type { Table } from '../../types';

interface TableContextMenuProps {
  table: Table;
  position: { x: number; y: number };
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAddColumn: () => void;
  onManageIndexes: () => void;
  onToggleExpand: () => void;
  isExpanded: boolean;
  onToggleShowAllColumns: () => void;
  showAllColumns: boolean;
}

const TableContextMenu: React.FC<TableContextMenuProps> = ({
  table,
  position,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onAddColumn,
  onManageIndexes,
  onToggleExpand,
  isExpanded,
  onToggleShowAllColumns,
  showAllColumns
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // ESC 키 누르면 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  
  // 메뉴 항목 클릭 핸들러
  const handleMenuItemClick = (callback: () => void) => {
    callback();
    onClose();
  };
  
  return (
    <div
      ref={menuRef}
      className="absolute bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
      style={{
        left: position.x,
        top: position.y,
        minWidth: '200px'
      }}
    >
      <div className="px-3 py-2 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-900 truncate">{table.name}</h3>
      </div>
      
      <div className="py-1">
        <button
          onClick={() => handleMenuItemClick(onEdit)}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center"
        >
          <PencilIcon className="w-4 h-4 mr-2" />
          테이블 편집
        </button>
        
        <button
          onClick={() => handleMenuItemClick(onAddColumn)}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          컬럼 추가
        </button>
        
        <button
          onClick={() => handleMenuItemClick(onManageIndexes)}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center"
        >
          <Cog6ToothIcon className="w-4 h-4 mr-2" />
          인덱스 관리
        </button>
        
        <button
          onClick={() => handleMenuItemClick(onDuplicate)}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center"
        >
          <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
          테이블 복제
        </button>
      </div>
      
      <div className="border-t border-gray-100 py-1">
        <button
          onClick={() => handleMenuItemClick(onToggleExpand)}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center"
        >
          {isExpanded ? (
            <>
              <ArrowsPointingInIcon className="w-4 h-4 mr-2" />
              테이블 축소
            </>
          ) : (
            <>
              <ArrowsPointingOutIcon className="w-4 h-4 mr-2" />
              테이블 확장
            </>
          )}
        </button>
        
        <button
          onClick={() => handleMenuItemClick(onToggleShowAllColumns)}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center"
        >
          {showAllColumns ? (
            <>
              <EyeSlashIcon className="w-4 h-4 mr-2" />
              일부 컬럼만 표시
            </>
          ) : (
            <>
              <EyeIcon className="w-4 h-4 mr-2" />
              모든 컬럼 표시
            </>
          )}
        </button>
      </div>
      
      <div className="border-t border-gray-100 py-1">
        <button
          onClick={() => handleMenuItemClick(onDelete)}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center"
        >
          <TrashIcon className="w-4 h-4 mr-2" />
          테이블 삭제
        </button>
      </div>
    </div>
  );
};

export default TableContextMenu;