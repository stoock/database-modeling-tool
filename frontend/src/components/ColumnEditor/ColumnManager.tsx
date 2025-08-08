import React, { useState, useCallback, useMemo } from 'react';
import { PlusIcon, Bars3Icon, QuestionMarkCircleIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import ColumnList from './ColumnList';
import ColumnAddModal from '../TableDesigner/ColumnAddModal';
import ColumnEditModal from '../TableDesigner/ColumnEditModal';
import ColumnOrderManager from '../TableDesigner/ColumnOrderManager';
import { useTableStore } from '../../stores/tableStore';
import { useProjectStore } from '../../stores/projectStore';
import { useColumnKeyboardShortcuts } from '../../hooks/useColumnKeyboardShortcuts';
import { validateAllColumns, getValidationSummary } from '../../utils/columnValidation';
import type { Column, Table, CreateColumnRequest } from '../../types';

interface ColumnManagerProps {
  table: Table | null;
  className?: string;
}

const ColumnManager: React.FC<ColumnManagerProps> = ({ table, className = '' }) => {
  const { 
    createColumn, 
    deleteColumn, 
    reorderColumns,
    selectedColumn,
    setSelectedColumn
  } = useTableStore();
  const { currentProject } = useProjectStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOrderManagerOpen, setIsOrderManagerOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [copyFromColumn, setCopyFromColumn] = useState<Column | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // 컬럼 선택 핸들러
  const handleSelectColumn = useCallback((columnId: string) => {
    const column = table?.columns.find(c => c.id === columnId);
    setSelectedColumn(column || null);
  }, [table?.columns, setSelectedColumn]);

  // 컬럼 편집 핸들러
  const handleEditColumn = useCallback((column: Column) => {
    setEditingColumn(column);
    setIsEditModalOpen(true);
  }, []);

  // 컬럼 삭제 핸들러
  const handleDeleteColumn = useCallback(async (columnId: string) => {
    if (!table) {
      alert('테이블 정보를 찾을 수 없습니다.');
      return;
    }

    const column = table.columns.find(c => c.id === columnId);
    if (!column) {
      alert('삭제할 컬럼을 찾을 수 없습니다.');
      return;
    }

    // 기본키 컬럼 삭제 방지
    if (column.primaryKey) {
      alert('기본키 컬럼은 삭제할 수 없습니다.');
      return;
    }

    if (!confirm(`컬럼 '${column.name}'을(를) 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteColumn(columnId);
      // 삭제된 컬럼이 선택된 컬럼이었다면 선택 해제
      if (selectedColumn?.id === columnId) {
        setSelectedColumn(null);
      }
    } catch (error: unknown) {
      console.error('컬럼 삭제 실패:', error);
      
      // 네트워크 오류와 서버 오류 구분
      const errorObj = error as { code?: string; message?: string; status?: number };
      if (errorObj?.code === 'NETWORK_ERROR' || errorObj?.message?.includes('fetch')) {
        alert('네트워크 연결을 확인하고 다시 시도해주세요.');
      } else if (errorObj?.status === 409) {
        alert('다른 테이블에서 참조 중인 컬럼은 삭제할 수 없습니다.');
      } else {
        alert(`컬럼 삭제에 실패했습니다: ${errorObj?.message || '알 수 없는 오류'}`);  
      }
    }
  }, [deleteColumn, table, selectedColumn, setSelectedColumn]);

  // 컬럼 복사 핸들러
  const handleDuplicateColumn = useCallback(async (column: Column) => {
    if (!table) {
      alert('테이블 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      // 중복되지 않는 이름 생성 (더 스마트한 로직)
      let copyName = `${column.name}_copy`;
      let counter = 1;
      
      // 기존 copy 패턴 확인 및 증분
      while (table.columns.some(c => c.name === copyName)) {
        copyName = `${column.name}_copy${counter}`;
        counter++;
        
        // 무한 루프 방지
        if (counter > 999) {
          copyName = `${column.name}_${Date.now()}`;
          break;
        }
      }

      const request: CreateColumnRequest = {
        name: copyName,
        description: column.description ? `${column.description} (복사본)` : `${column.name} 컬럼의 복사본`,
        dataType: column.dataType,
        maxLength: column.maxLength,
        precision: column.precision,
        scale: column.scale,
        nullable: column.nullable,
        primaryKey: false, // 복사된 컬럼은 기본키가 될 수 없음
        identity: false, // 복사된 컬럼은 자동증가가 될 수 없음
        defaultValue: column.defaultValue,
        orderIndex: table.columns?.length || 0,
      };

      const newColumn = await createColumn(table.id, request);
      if (newColumn) {
        setSelectedColumn(newColumn);
        alert(`컬럼 '${copyName}'이(가) 성공적으로 복사되었습니다.`);
      }
    } catch (error: unknown) {
      console.error('컬럼 복사 실패:', error);
      
      // 구체적인 오류 메시지 제공
      const errorObj = error as { code?: string; message?: string; status?: number };
      if (errorObj?.status === 400) {
        alert('컬럼 정보가 올바르지 않습니다. 원본 컬럼을 확인해주세요.');
      } else if (errorObj?.code === 'NETWORK_ERROR') {
        alert('네트워크 연결을 확인하고 다시 시도해주세요.');
      } else {
        alert(`컬럼 복사에 실패했습니다: ${errorObj?.message || '알 수 없는 오류'}`);
      }
    }
  }, [table, createColumn, setSelectedColumn]);

  // 컬럼 추가 핸들러
  const handleAddColumn = useCallback(() => {
    setCopyFromColumn(null);
    setIsAddModalOpen(true);
  }, []);



  // 컬럼 순서 변경 핸들러
  const handleMoveColumn = useCallback(async (columnId: string, direction: 'up' | 'down') => {
    if (!table) {
      alert('테이블 정보를 찾을 수 없습니다.');
      return;
    }

    const sortedColumns = [...(table.columns || [])].sort((a, b) => a.orderIndex - b.orderIndex);
    const currentIndex = sortedColumns.findIndex(c => c.id === columnId);
    
    if (currentIndex === -1) {
      alert('이동할 컬럼을 찾을 수 없습니다.');
      return;
    }
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // 경계 검사
    if (newIndex < 0) {
      alert('첫 번째 컬럼은 더 이상 위로 이동할 수 없습니다.');
      return;
    }
    
    if (newIndex >= sortedColumns.length) {
      alert('마지막 컬럼은 더 이상 아래로 이동할 수 없습니다.');
      return;
    }

    // 배열에서 순서 변경
    const newColumns = [...sortedColumns];
    [newColumns[currentIndex], newColumns[newIndex]] = [newColumns[newIndex], newColumns[currentIndex]];
    
    // orderIndex 업데이트
    const updatedColumns = newColumns.map((column, index) => ({
      ...column,
      orderIndex: index
    }));

    try {
      const columnIds = updatedColumns.map(col => col.id);
      await reorderColumns(table.id, columnIds);
      
      const movedColumn = sortedColumns[currentIndex];
      alert(`컬럼 '${movedColumn.name}'의 순서가 변경되었습니다.`);
    } catch (error: unknown) {
      console.error('컬럼 순서 변경 실패:', error);
      
      const errorObj = error as { code?: string; message?: string; status?: number };
      if (errorObj?.status === 409) {
        alert('다른 사용자가 컬럼 순서를 변경했습니다. 페이지를 새로고침해주세요.');
      } else if (errorObj?.code === 'NETWORK_ERROR') {
        alert('네트워크 연결을 확인하고 다시 시도해주세요.');
      } else {
        alert(`컬럼 순서 변경에 실패했습니다: ${errorObj?.message || '알 수 없는 오류'}`);
      }
    }
  }, [table, reorderColumns]);

  // 컬럼 순서 재정렬 핸들러 (드래그앤드롭용)
  const handleReorderColumns = useCallback(async (newColumns: Column[]) => {
    if (!table) {
      console.warn('테이블 정보가 없어 컬럼 순서를 변경할 수 없습니다.');
      return;
    }

    // 변경사항이 있는지 확인
    const currentOrder = table.columns.map(col => col.id).join(',');
    const newOrder = newColumns.map(col => col.id).join(',');
    
    if (currentOrder === newOrder) {
      console.log('컬럼 순서에 변경사항이 없습니다.');
      return;
    }

    try {
      const columnIds = newColumns.map(col => col.id);
      await reorderColumns(table.id, columnIds);
      
      console.log('컬럼 순서가 성공적으로 변경되었습니다.');
    } catch (error: unknown) {
      console.error('컬럼 순서 변경 실패:', error);
      
      // 사용자에게 구체적인 피드백 제공
      const errorObj = error as { code?: string; message?: string; status?: number };
      if (errorObj?.status === 409) {
        alert('다른 사용자가 컬럼 순서를 변경했습니다. 페이지를 새로고침해주세요.');
      } else if (errorObj?.code === 'NETWORK_ERROR') {
        alert('네트워크 연결 문제로 컬럼 순서 변경에 실패했습니다.');
      } else {
        alert(`컬럼 순서 변경에 실패했습니다: ${errorObj?.message || '알 수 없는 오류'}`);
      }
      
      // 에러 발생 시 원래 순서로 복원하려고 시도
      try {
        window.location.reload();
      } catch (reloadError) {
        console.error('페이지 새로고침 실패:', reloadError);
      }
    }
  }, [table, reorderColumns]);

  // 컬럼 검증 결과
  const validationResults = useMemo(() => {
    if (!table?.columns) return {};
    return validateAllColumns(table.columns, currentProject?.namingRules);
  }, [table?.columns, currentProject?.namingRules]);

  const validationSummary = useMemo(() => {
    return getValidationSummary(validationResults);
  }, [validationResults]);

  // 키보드 단축키 설정
  const { shortcuts } = useColumnKeyboardShortcuts({
    selectedColumn,
    columns: table?.columns || [],
    onEditColumn: handleEditColumn,
    onDeleteColumn: handleDeleteColumn,
    onDuplicateColumn: handleDuplicateColumn,
    onAddColumn: handleAddColumn,
    onMoveColumn: handleMoveColumn,
    onSelectColumn: handleSelectColumn,
    isModalOpen: isAddModalOpen || isEditModalOpen || isOrderManagerOpen,
  });

  if (!table) {
    return (
      <div className={`bg-white shadow rounded-lg ${className}`}>
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">테이블을 선택해주세요.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white shadow rounded-lg ${className}`}>
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              컬럼 관리{table?.name ? ` - ${table.name}` : ''}
            </h3>
            <div className="flex items-center space-x-2">
              {/* 검증 상태 표시 */}
              {(table.columns?.length || 0) > 0 && (
                <div className="flex items-center space-x-2">
                  {validationSummary.totalErrors > 0 ? (
                    <div className="flex items-center text-red-600">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm">{validationSummary.totalErrors}개 오류</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-green-600">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm">검증 통과</span>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => setShowValidation(!showValidation)}
                    variant="ghost"
                    size="sm"
                    title="검증 결과"
                  >
                    검증
                  </Button>
                </div>
              )}

              <Button
                onClick={() => setShowShortcuts(!showShortcuts)}
                variant="ghost"
                size="sm"
                title="키보드 단축키"
              >
                <QuestionMarkCircleIcon className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setIsOrderManagerOpen(true)}
                variant="secondary"
                size="sm"
                disabled={(table.columns?.length || 0) === 0}
              >
                <Bars3Icon className="h-4 w-4 mr-1" />
                순서 관리
              </Button>
              <Button
                onClick={handleAddColumn}
                size="sm"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                컬럼 추가
              </Button>
            </div>
          </div>

          {/* 검증 결과 */}
          {showValidation && (table.columns?.length || 0) > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">검증 결과</h4>
              
              <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{validationSummary.totalColumns}</div>
                  <div className="text-gray-600">전체 컬럼</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{validationSummary.validColumns}</div>
                  <div className="text-gray-600">유효한 컬럼</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">{validationSummary.totalErrors}</div>
                  <div className="text-gray-600">오류</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-yellow-600">{validationSummary.totalWarnings}</div>
                  <div className="text-gray-600">경고</div>
                </div>
              </div>

              {validationSummary.totalErrors > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-red-900">오류가 있는 컬럼:</h5>
                  {Object.entries(validationResults)
                    .filter(([, result]) => result.errors.length > 0)
                    .map(([columnId, result]) => {
                      const column = table.columns?.find(c => c.id === columnId);
                      return (
                        <div key={columnId} className="text-sm">
                          <div className="font-medium text-red-800">{column?.name}</div>
                          <ul className="ml-4 text-red-700 list-disc">
                            {result.errors.map((error, index) => (
                              <li key={index}>{error.message}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* 키보드 단축키 도움말 */}
          {showShortcuts && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">키보드 단축키</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="font-mono bg-blue-100 px-1 rounded">{shortcut.key}</span>
                    <span>{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ColumnList
            columns={table.columns}
            selectedColumnId={selectedColumn?.id}
            onSelectColumn={handleSelectColumn}
            onEditColumn={handleEditColumn}
            onDeleteColumn={handleDeleteColumn}
            onDuplicateColumn={handleDuplicateColumn}
            onAddColumn={handleAddColumn}
            onMoveColumn={handleMoveColumn}
            onReorderColumns={handleReorderColumns}
          />
        </div>
      </div>

      {/* 컬럼 추가 모달 */}
      <ColumnAddModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setCopyFromColumn(null);
        }}
        tableId={table.id}
        copyFromColumn={copyFromColumn}
      />

      {/* 컬럼 편집 모달 */}
      <ColumnEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingColumn(null);
        }}
        column={editingColumn}
        onSuccess={(updatedColumn) => {
          setSelectedColumn(updatedColumn);
        }}
      />

      {/* 컬럼 순서 관리 모달 */}
      <ColumnOrderManager
        isOpen={isOrderManagerOpen}
        onClose={() => setIsOrderManagerOpen(false)}
        table={table}
      />
    </>
  );
};

export default ColumnManager;