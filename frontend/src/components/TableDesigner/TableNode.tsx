import React, { memo, useCallback, useEffect, useState, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { 
  TableCellsIcon, 
  KeyIcon, 
  EyeIcon,
  PencilIcon,
  TrashIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  ArrowsPointingOutIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { 
  KeyIcon as KeyIconSolid,
  EyeSlashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';
import { useChangeTracker } from '../../utils/changeTracker';

import type { TableNodeData, Column } from '../../types';
import { useTableStore } from '../../stores/tableStore';
import { useValidationStore } from '../../stores/validationStore';
import { useProjectStore } from '../../stores/projectStore';
import TableContextMenu from './TableContextMenu';
import ColumnEditModal from './ColumnEditModal';
import IndexManagerModal from './IndexManagerModal';

interface TableNodeProps extends NodeProps<TableNodeData> {}

const TableNode: React.FC<TableNodeProps> = memo(({ data, selected, id }) => {
  const { table, isSelected } = data;
  const { deleteTable, setSelectedTable, updateTable } = useTableStore();
  const { validateTable, tableValidations } = useValidationStore();
  const { currentProject } = useProjectStore();
  const changeTracker = useChangeTracker();
  
  const [isHovered, setIsHovered] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });
  const [columnEditModal, setColumnEditModal] = useState<{
    isOpen: boolean;
    column: Column | null;
  }>({ isOpen: false, column: null });
  const [indexManagerModal, setIndexManagerModal] = useState<{
    isOpen: boolean;
  }>({ isOpen: false });
  const nodeRef = useRef<HTMLDivElement>(null);

  // 컬럼 타입별 아이콘 반환
  const getColumnTypeIcon = useCallback((column: Column) => {
    if (column.isPrimaryKey) {
      return <KeyIconSolid className="w-3 h-3 text-yellow-600" title="기본키" />;
    }
    if (!column.isNullable) {
      return <EyeIcon className="w-3 h-3 text-blue-600" title="필수" />;
    }
    return <EyeSlashIcon className="w-3 h-3 text-gray-400" title="선택적" />;
  }, []);

  // 데이터 타입 표시 형식 변환
  const formatDataType = useCallback((column: Column) => {
    let typeStr = column.dataType;
    
    if (column.maxLength && ['VARCHAR', 'NVARCHAR', 'CHAR', 'NCHAR'].includes(column.dataType)) {
      typeStr += `(${column.maxLength})`;
    } else if (column.precision && ['DECIMAL', 'NUMERIC'].includes(column.dataType)) {
      typeStr += `(${column.precision}${column.scale ? `,${column.scale}` : ''})`;
    }
    
    return typeStr;
  }, []);

  // 테이블 편집 버튼 클릭
  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTable(table);
    
    // 테이블 편집 모달 열기 이벤트 발생
    const event = new CustomEvent('editTable', { 
      detail: { table } 
    });
    window.dispatchEvent(event);
  }, [table, setSelectedTable]);

  // 테이블 삭제 버튼 클릭
  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm(`테이블 "${table.name}"을(를) 삭제하시겠습니까?`)) {
      deleteTable(table.id);
    }
  }, [table, deleteTable]);

  // 테이블 복제 버튼 클릭
  const handleDuplicateClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm(`테이블 "${table.name}"을(를) 복제하시겠습니까?`)) {
      // 테이블 복제 이벤트 발생
      const event = new CustomEvent('duplicateTable', { 
        detail: { table } 
      });
      window.dispatchEvent(event);
    }
  }, [table]);

  // 컬럼 추가 버튼 클릭
  const handleAddColumnClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTable(table);
    
    // 컬럼 추가 모달 열기 이벤트 발생
    const event = new CustomEvent('addColumn', { 
      detail: { tableId: table.id } 
    });
    window.dispatchEvent(event);
  }, [table, setSelectedTable]);

  // 인덱스 관리 버튼 클릭
  const handleIndexClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTable(table);
    setIndexManagerModal({ isOpen: true });
  }, [table, setSelectedTable]);
  
  // 테이블 확장/축소 토글
  const toggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  }, [isExpanded]);
  
  // 모든 컬럼 표시/숨기기 토글
  const toggleShowAllColumns = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAllColumns(!showAllColumns);
  }, [showAllColumns]);
  
  // 테이블 노드 클릭 시 선택 상태로 변경
  const handleNodeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTable(table);
  }, [table, setSelectedTable]);
  
  // 컨텍스트 메뉴 표시
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY
    });
    setSelectedTable(table);
  }, [table, setSelectedTable]);
  
  // 컨텍스트 메뉴 닫기
  const closeContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0 });
  }, []);
  
  // 드래그 시작 시 상태 변경
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);
  
  // 드래그 종료 시 상태 변경
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    // 위치 변경 저장 시각적 피드백
    setIsSaving(true);
    setSaveSuccess(false);
    
    // 변경사항 추적
    changeTracker.trackChange('table', table.id);
    
    setTimeout(() => {
      setSaveSuccess(true);
      setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(false);
      }, 1000);
    }, 500);
  }, [table.id, changeTracker]);

  // 실시간 검증
  useEffect(() => {
    if (currentProject?.namingRules) {
      const errors = validateTable(table, currentProject.namingRules);
      setValidationErrors(errors.map(e => e.message));
    }
  }, [table, currentProject?.namingRules, validateTable]);
  
  // 드래그 이벤트 리스너 등록
  useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      node.addEventListener('mousedown', handleDragStart);
      node.addEventListener('mouseup', handleDragEnd);
      
      return () => {
        node.removeEventListener('mousedown', handleDragStart);
        node.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [handleDragStart, handleDragEnd]);

  // 검증 오류 상태
  const hasValidationErrors = validationErrors.length > 0 || tableValidations[table.id]?.length > 0;
  const allErrors = [
    ...validationErrors,
    ...(tableValidations[table.id] || []).map(e => e.message)
  ];
  
  // 표시할 컬럼 수 결정
  const displayColumnCount = showAllColumns ? table.columns.length : (isExpanded ? 12 : 6);
  const hasMoreColumns = table.columns.length > displayColumnCount;

  const nodeClasses = `
    bg-white rounded-lg shadow-md border-2 transition-all duration-200 min-w-[280px] max-w-[400px] relative
    ${isSelected || selected 
      ? hasValidationErrors 
        ? 'border-red-500 shadow-lg shadow-red-200' 
        : 'border-blue-500 shadow-lg shadow-blue-200'
      : hasValidationErrors
        ? 'border-red-300 hover:border-red-400'
        : 'border-gray-200 hover:border-gray-300'
    }
    ${isHovered ? 'transform scale-[1.02]' : ''}
    ${isDragging ? 'cursor-grabbing opacity-90' : 'cursor-grab'}
    ${isExpanded ? 'z-10' : ''}
  `;

  return (
    <div 
      ref={nodeRef}
      className={nodeClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleNodeClick}
      onContextMenu={handleContextMenu}
    >
      {/* 연결 핸들 - 상단 */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />
      
      {/* 검증 오류 표시 */}
      {hasValidationErrors && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="relative group">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-4 h-4 text-white" />
            </div>
            {/* 툴팁 */}
            <div className="absolute right-0 top-8 w-64 p-2 bg-red-600 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
              <div className="space-y-1">
                {allErrors.slice(0, 3).map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
                {allErrors.length > 3 && (
                  <div>... 외 {allErrors.length - 3}개</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 저장 상태 표시 */}
      {isSaving && (
        <div className="absolute -top-2 -left-2 z-10">
          <div className="relative">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ${
              saveSuccess ? 'bg-green-500' : 'bg-blue-500'
            }`}>
              {saveSuccess ? (
                <CheckCircleIcon className="w-4 h-4 text-white" />
              ) : (
                <ArrowPathIcon className="w-4 h-4 text-white animate-spin" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 테이블 헤더 */}
      <div className={`flex items-center justify-between p-3 rounded-t-lg border-b border-gray-200 ${
        hasValidationErrors ? 'bg-red-50' : isSelected || selected ? 'bg-blue-50' : 'bg-gray-50'
      }`}>
        <div className="flex items-center space-x-2">
          <TableCellsIcon className={`w-5 h-5 ${
            hasValidationErrors 
              ? 'text-red-600' 
              : isSelected || selected 
                ? 'text-blue-600' 
                : 'text-gray-600'
          }`} />
          <div>
            <h3 className={`font-semibold text-sm ${
              hasValidationErrors 
                ? 'text-red-900' 
                : isSelected || selected 
                  ? 'text-blue-900' 
                  : 'text-gray-900'
            }`}>
              {table.name}
            </h3>
            {table.description && (
              <p className={`text-xs mt-1 ${
                hasValidationErrors 
                  ? 'text-red-600' 
                  : isSelected || selected 
                    ? 'text-blue-600' 
                    : 'text-gray-500'
              }`}>
                {table.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={toggleExpand}
            className="p-1 text-gray-400 hover:text-blue-600 rounded"
            title={isExpanded ? "테이블 축소" : "테이블 확장"}
          >
            <ArrowsPointingOutIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={handleEditClick}
            className="p-1 text-gray-400 hover:text-blue-600 rounded"
            title="테이블 편집"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleIndexClick}
            className="p-1 text-gray-400 hover:text-green-600 rounded"
            title="인덱스 관리"
          >
            <Cog6ToothIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleDuplicateClick}
            className="p-1 text-gray-400 hover:text-purple-600 rounded"
            title="테이블 복제"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1 text-gray-400 hover:text-red-600 rounded"
            title="테이블 삭제"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 컬럼 목록 */}
      <div className={`p-3 ${isExpanded ? 'max-h-[500px] overflow-y-auto' : ''}`}>
        {table.columns.length > 0 ? (
          <div className="space-y-1">
            {table.columns
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .slice(0, displayColumnCount)
              .map((column) => (
                <div
                  key={column.id}
                  className={`flex items-center justify-between py-1 px-2 rounded group transition-colors duration-150 ${
                    isHovered || isSelected || selected ? 'hover:bg-blue-50' : 'hover:bg-gray-50'
                  } cursor-pointer`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setColumnEditModal({ isOpen: true, column });
                  }}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getColumnTypeIcon(column)}
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {column.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 font-mono">
                      {formatDataType(column)}
                    </span>
                    {column.isIdentity && (
                      <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
                        AI
                      </span>
                    )}
                    {!column.isNullable && !column.isPrimaryKey && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                        필수
                      </span>
                    )}
                    {column.isPrimaryKey && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                        PK
                      </span>
                    )}
                  </div>
                </div>
              ))}
            
            {hasMoreColumns && (
              <button
                onClick={toggleShowAllColumns}
                className="w-full text-xs text-center py-1 text-blue-600 hover:text-blue-800 hover:underline"
              >
                {showAllColumns ? "컬럼 접기" : `... 외 ${table.columns.length - displayColumnCount}개 컬럼 더 보기`}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <TableCellsIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">컬럼이 없습니다</p>
          </div>
        )}

        {/* 컬럼 추가 버튼 */}
        <button
          onClick={handleAddColumnClick}
          className={`w-full mt-3 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ${
            isHovered || isSelected || selected
              ? 'text-blue-700 border-blue-300 bg-blue-50 hover:bg-blue-100 focus:ring-blue-500'
              : 'text-blue-600 border-blue-200 hover:bg-blue-50 focus:ring-blue-500'
          }`}
        >
          + 컬럼 추가
        </button>
      </div>

      {/* 테이블 통계 및 정보 */}
      <div className="px-3 pb-3">
        <div className={`flex items-center justify-between text-xs rounded px-2 py-1 ${
          hasValidationErrors 
            ? 'text-red-600 bg-red-50' 
            : isSelected || selected
              ? 'text-blue-600 bg-blue-50'
              : isHovered
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 bg-gray-50'
        }`}>
          <span>컬럼: {table.columns.length}개</span>
          <span>인덱스: {table.indexes.length}개</span>
          {hasValidationErrors && (
            <span className="text-red-700 font-medium">오류 {allErrors.length}개</span>
          )}
        </div>
        
        {/* 확장 시 추가 정보 표시 */}
        {isExpanded && (
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>생성일:</span>
              <span>{new Date(table.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>수정일:</span>
              <span>{new Date(table.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>ID:</span>
              <span className="font-mono">{table.id.substring(0, 8)}...</span>
            </div>
          </div>
        )}
      </div>

      {/* 연결 핸들 - 하단 */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />
      
      {/* 연결 핸들 - 좌측 */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />
      
      {/* 연결 핸들 - 우측 */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />
      
      {/* 컨텍스트 메뉴 */}
      {contextMenu.visible && (
        <TableContextMenu
          table={table}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={closeContextMenu}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onDuplicate={handleDuplicateClick}
          onAddColumn={handleAddColumnClick}
          onManageIndexes={handleIndexClick}
          onToggleExpand={toggleExpand}
          isExpanded={isExpanded}
          onToggleShowAllColumns={toggleShowAllColumns}
          showAllColumns={showAllColumns}
        />
      )}
      
      {/* 컬럼 편집 모달 */}
      <ColumnEditModal
        isOpen={columnEditModal.isOpen}
        onClose={() => setColumnEditModal({ isOpen: false, column: null })}
        column={columnEditModal.column}
      />
      
      {/* 인덱스 관리 모달 */}
      <IndexManagerModal
        isOpen={indexManagerModal.isOpen}
        onClose={() => setIndexManagerModal({ isOpen: false })}
        tableId={table.id}
      />
    </div>
  );
});

TableNode.displayName = 'TableNode';

export default TableNode;