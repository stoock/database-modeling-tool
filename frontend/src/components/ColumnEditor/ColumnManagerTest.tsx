import React, { useState } from 'react';
import ColumnList from './ColumnList';
import type { Column, Table } from '../../types';

// 테스트용 더미 데이터
const mockTable: Table = {
  id: 'table-1',
  projectId: 'project-1',
  name: 'Users',
  description: '사용자 테이블',
  positionX: 0,
  positionY: 0,
  columns: [
    {
      id: 'col-1',
      tableId: 'table-1',
      name: 'id',
      description: '사용자 ID',
      dataType: 'BIGINT',
      nullable: false,
      primaryKey: true,
      identity: true,
      identitySeed: 1,
      identityIncrement: 1,
      orderIndex: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'col-2',
      tableId: 'table-1',
      name: 'username',
      description: '사용자명',
      dataType: 'NVARCHAR',
      maxLength: 50,
      nullable: false,
      primaryKey: false,
      identity: false,
      orderIndex: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'col-3',
      tableId: 'table-1',
      name: 'email',
      description: '이메일 주소',
      dataType: 'NVARCHAR',
      maxLength: 255,
      nullable: false,
      primaryKey: false,
      identity: false,
      orderIndex: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'col-4',
      tableId: 'table-1',
      name: 'created_at',
      description: '생성일시',
      dataType: 'DATETIME2',
      nullable: false,
      primaryKey: false,
      identity: false,
      defaultValue: 'GETDATE()',
      orderIndex: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  indexes: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * 컬럼 관리 기능 테스트 컴포넌트
 */
const ColumnManagerTest: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>(mockTable.columns);
  const [selectedColumnId, setSelectedColumnId] = useState<string | undefined>();

  const handleSelectColumn = (columnId: string) => {
    setSelectedColumnId(columnId);
    console.log('선택된 컬럼:', columnId);
  };

  const handleEditColumn = (column: Column) => {
    console.log('컬럼 편집:', column);
    alert(`컬럼 "${column.name}" 편집 (실제로는 모달이 열립니다)`);
  };

  const handleDeleteColumn = (columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    if (column && window.confirm(`컬럼 "${column.name}"을(를) 삭제하시겠습니까?`)) {
      setColumns(prev => prev.filter(c => c.id !== columnId));
      if (selectedColumnId === columnId) {
        setSelectedColumnId(undefined);
      }
      console.log('컬럼 삭제:', columnId);
    }
  };

  const handleDuplicateColumn = (column: Column) => {
    const newColumn: Column = {
      ...column,
      id: `${column.id}_copy_${Date.now()}`,
      name: `${column.name}_copy`,
      description: column.description ? `${column.description} (복사본)` : undefined,
      primaryKey: false, // 복사된 컬럼은 기본키가 될 수 없음
      identity: false, // 복사된 컬럼은 자동증가가 될 수 없음
      orderIndex: columns.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setColumns(prev => [...prev, newColumn]);
    setSelectedColumnId(newColumn.id);
    console.log('컬럼 복사:', newColumn);
  };

  const handleAddColumn = () => {
    console.log('컬럼 추가 (실제로는 모달이 열립니다)');
    alert('컬럼 추가 모달이 열립니다');
  };

  const handleMoveColumn = (columnId: string, direction: 'up' | 'down') => {
    const sortedColumns = [...columns].sort((a, b) => a.orderIndex - b.orderIndex);
    const currentIndex = sortedColumns.findIndex(c => c.id === columnId);
    
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= sortedColumns.length) return;

    // 배열에서 순서 변경
    const newColumns = [...sortedColumns];
    [newColumns[currentIndex], newColumns[newIndex]] = [newColumns[newIndex], newColumns[currentIndex]];
    
    // orderIndex 업데이트
    const updatedColumns = newColumns.map((column, index) => ({
      ...column,
      orderIndex: index
    }));

    setColumns(updatedColumns);
    console.log(`컬럼 ${direction === 'up' ? '위로' : '아래로'} 이동:`, columnId);
  };

  const handleReorderColumns = (newColumns: Column[]) => {
    // orderIndex 업데이트
    const updatedColumns = newColumns.map((column, index) => ({
      ...column,
      orderIndex: index
    }));
    
    setColumns(updatedColumns);
    console.log('컬럼 순서 변경:', updatedColumns.map(c => c.name));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            컬럼 관리 기능 테스트
          </h2>
          
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              테스트 테이블: {mockTable.name}
            </h3>
            <p className="text-sm text-blue-700">
              {mockTable.description}
            </p>
            <div className="text-sm text-blue-600 mt-2">
              컬럼 수: {columns.length}개
              {selectedColumnId && (
                <span className="ml-4">
                  선택된 컬럼: {columns.find(c => c.id === selectedColumnId)?.name}
                </span>
              )}
            </div>
          </div>

          <ColumnList
            columns={columns}
            selectedColumnId={selectedColumnId}
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

      {/* 기능 설명 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          테스트 가능한 기능
        </h3>
        <div className="text-xs text-gray-700 space-y-1">
          <div>• 컬럼 클릭으로 선택</div>
          <div>• 드래그앤드롭으로 순서 변경</div>
          <div>• 편집 버튼으로 컬럼 편집 (모의)</div>
          <div>• 복사 버튼으로 컬럼 복사</div>
          <div>• 삭제 버튼으로 컬럼 삭제</div>
          <div>• 위/아래 화살표로 순서 변경</div>
          <div>• 컬럼 추가 버튼 (모의)</div>
        </div>
      </div>
    </div>
  );
};

export default ColumnManagerTest;