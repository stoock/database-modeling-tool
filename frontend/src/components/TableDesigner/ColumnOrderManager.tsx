import React, { useState } from 'react';
import { 
  Bars3Icon, 
  PencilIcon, 
  TrashIcon,
  DocumentDuplicateIcon,
  KeyIcon,
  EyeSlashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useTableStore } from '../../stores/tableStore';
import ColumnEditModal from './ColumnEditModal';
import type { Column, Table, CreateColumnRequest } from '../../types';

interface ColumnOrderManagerProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
}

// 드래그 가능한 컬럼 아이템 컴포넌트
interface SortableColumnItemProps {
  column: Column;
  index: number;
  onEdit: (column: Column) => void;
  onDelete: (column: Column) => void;
  onDuplicate: (column: Column) => void;
}

const SortableColumnItem: React.FC<SortableColumnItemProps> = ({
  column,
  index,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getDataTypeDisplay = (column: Column) => {
    let display = column.dataType;
    
    if (column.maxLength) {
      display += `(${column.maxLength})`;
    } else if (column.precision) {
      display += `(${column.precision}${column.scale ? `,${column.scale}` : ''})`;
    }
    
    return display;
  };

  const getColumnBadges = (column: Column) => {
    const badges = [];
    
    if (column.isPrimaryKey) {
      badges.push(
        <span key="pk" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          <KeyIcon className="w-3 h-3 mr-1" />
          PK
        </span>
      );
    }
    
    if (column.isIdentity) {
      badges.push(
        <span key="identity" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          AI
        </span>
      );
    }
    
    if (!column.isNullable) {
      badges.push(
        <span key="not-null" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
          NOT NULL
        </span>
      );
    }
    
    return badges;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${
        isDragging ? 'shadow-lg border-blue-300' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {/* 드래그 핸들 */}
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
          >
            <Bars3Icon className="w-5 h-5" />
          </div>

          {/* 순서 번호 */}
          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
            {index + 1}
          </div>

          {/* 컬럼 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {column.name}
              </h4>
              <span className="text-sm text-gray-500">
                {getDataTypeDisplay(column)}
              </span>
            </div>
            
            {column.description && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                {column.description}
              </p>
            )}
            
            {/* 배지들 */}
            <div className="flex items-center space-x-1 mt-2">
              {getColumnBadges(column)}
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(column)}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            title="편집"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onDuplicate(column)}
            className="p-2 text-gray-400 hover:text-green-600 rounded-md hover:bg-green-50 transition-colors"
            title="복사"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onDelete(column)}
            className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
            title="삭제"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ColumnOrderManager: React.FC<ColumnOrderManagerProps> = ({
  isOpen,
  onClose,
  table
}) => {
  const { reorderColumns, deleteColumn, createColumn, isLoading } = useTableStore();
  const [columns, setColumns] = useState<Column[]>([]);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmColumn, setDeleteConfirmColumn] = useState<Column | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 테이블이 변경될 때 컬럼 목록 업데이트
  React.useEffect(() => {
    if (table?.columns) {
      const sortedColumns = [...table.columns].sort((a, b) => a.orderIndex - b.orderIndex);
      setColumns(sortedColumns);
    }
  }, [table]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over?.id) {
      const oldIndex = columns.findIndex((column) => column.id === active.id);
      const newIndex = columns.findIndex((column) => column.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newColumns = arrayMove(columns, oldIndex, newIndex);
        // orderIndex 업데이트
        const updatedColumns = newColumns.map((column, index) => ({
          ...column,
          orderIndex: index
        }));
        setColumns(updatedColumns);

        // 서버에 순서 변경 요청
        if (table) {
          try {
            const columnIds = updatedColumns.map(col => col.id);
            await reorderColumns(table.id, columnIds);
          } catch (error) {
            // 에러 발생 시 원래 순서로 복원
            const sortedColumns = [...table.columns].sort((a, b) => a.orderIndex - b.orderIndex);
            setColumns(sortedColumns);
            console.error('컬럼 순서 변경 실패:', error);
            // 사용자에게 에러 알림
            alert('컬럼 순서 변경에 실패했습니다. 다시 시도해주세요.');
          }
        }
      }
    }
  };

  const handleEditColumn = (column: Column) => {
    setEditingColumn(column);
    setIsEditModalOpen(true);
  };

  const handleDeleteColumn = async (column: Column) => {
    setDeleteConfirmColumn(column);
  };

  const confirmDeleteColumn = async () => {
    if (!deleteConfirmColumn) return;

    try {
      const success = await deleteColumn(deleteConfirmColumn.id);
      if (success) {
        // 로컬 상태에서도 제거
        setColumns(prev => prev.filter(c => c.id !== deleteConfirmColumn.id));
        setDeleteConfirmColumn(null);
      }
    } catch (error) {
      console.error('컬럼 삭제 실패:', error);
    }
  };

  const handleDuplicateColumn = async (column: Column) => {
    if (!table) return;

    try {
      // 중복되지 않는 이름 생성
      let copyName = `${column.name}_copy`;
      let counter = 1;
      while (columns.some(c => c.name === copyName)) {
        copyName = `${column.name}_copy${counter}`;
        counter++;
      }

      const request: CreateColumnRequest = {
        name: copyName,
        description: column.description ? `${column.description} (복사본)` : undefined,
        dataType: column.dataType,
        maxLength: column.maxLength,
        precision: column.precision,
        scale: column.scale,
        isNullable: column.isNullable,
        isPrimaryKey: false, // 복사된 컬럼은 기본키가 될 수 없음
        isIdentity: false, // 복사된 컬럼은 자동증가가 될 수 없음
        defaultValue: column.defaultValue,
        orderIndex: columns.length,
      };

      const newColumn = await createColumn(table.id, request);
      if (newColumn) {
        setColumns(prev => [...prev, newColumn].sort((a, b) => a.orderIndex - b.orderIndex));
        // 성공 메시지
        console.log(`컬럼 "${column.name}"이(가) "${copyName}"으로 복사되었습니다.`);
      }
    } catch (error) {
      console.error('컬럼 복사 실패:', error);
      alert('컬럼 복사에 실패했습니다. 다시 시도해주세요.');
    }
  };



  if (!table) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`컬럼 순서 관리 - ${table.name}`}
        size="xl"
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            컬럼을 드래그하여 순서를 변경할 수 있습니다.
          </div>

          <div className="min-h-[200px] p-4 rounded-lg border border-gray-200">
            {columns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                컬럼이 없습니다. 먼저 컬럼을 추가해주세요.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={columns.map(col => col.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {columns.map((column, index) => (
                      <SortableColumnItem
                        key={column.id}
                        column={column}
                        index={index}
                        onEdit={handleEditColumn}
                        onDelete={handleDeleteColumn}
                        onDuplicate={handleDuplicateColumn}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button onClick={onClose}>
              완료
            </Button>
          </div>
        </div>
      </Modal>

      {/* 컬럼 편집 모달 */}
      <ColumnEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingColumn(null);
        }}
        column={editingColumn}
        onSuccess={(updatedColumn) => {
          // 로컬 상태 업데이트
          setColumns(prev => 
            prev.map(col => col.id === updatedColumn.id ? updatedColumn : col)
          );
        }}
      />

      {/* 삭제 확인 다이얼로그 */}
      {deleteConfirmColumn && (
        <Modal
          isOpen={!!deleteConfirmColumn}
          onClose={() => setDeleteConfirmColumn(null)}
          title="컬럼 삭제 확인"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-900">
                  컬럼 <strong>"{deleteConfirmColumn.name}"</strong>을(를) 정말 삭제하시겠습니까?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  이 작업은 되돌릴 수 없습니다.
                </p>
                {deleteConfirmColumn.isPrimaryKey && (
                  <div className="mt-3 p-3 bg-red-50 rounded-md">
                    <p className="text-sm text-red-800">
                      <strong>경고:</strong> 이 컬럼은 기본키입니다. 삭제하면 테이블의 무결성에 영향을 줄 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDeleteConfirmColumn(null)}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={confirmDeleteColumn}
                disabled={isLoading}
              >
                {isLoading ? '삭제 중...' : '삭제'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ColumnOrderManager;