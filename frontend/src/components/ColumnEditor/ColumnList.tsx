import React from 'react';
import type { Column } from '../../types';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  DocumentDuplicateIcon,
  Bars3Icon
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

interface ColumnListProps {
  columns: Column[];
  selectedColumnId?: string;
  onSelectColumn: (columnId: string) => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
  onDuplicateColumn: (column: Column) => void;
  onAddColumn: () => void;
  onMoveColumn: (columnId: string, direction: 'up' | 'down') => void;
  onReorderColumns: (newColumns: Column[]) => void;
}

// 드래그 가능한 컬럼 아이템 컴포넌트
interface SortableColumnItemProps {
  column: Column;
  index: number;
  isSelected: boolean;
  onSelect: (columnId: string) => void;
  onEdit: (column: Column) => void;
  onDelete: (columnId: string) => void;
  onDuplicate: (column: Column) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const SortableColumnItem: React.FC<SortableColumnItemProps> = ({
  column,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
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

  const getDataTypeDisplay = (column: Column): string => {
    const { dataType, maxLength, precision, scale } = column;
    
    switch (dataType) {
      case 'VARCHAR':
      case 'NVARCHAR':
      case 'CHAR':
      case 'NCHAR':
        return maxLength ? `${dataType}(${maxLength})` : dataType;
      case 'DECIMAL':
      case 'NUMERIC':
        return precision && scale !== undefined 
          ? `${dataType}(${precision},${scale})` 
          : dataType;
      default:
        return dataType;
    }
  };

  const getColumnBadges = (column: Column) => {
    const badges = [];
    
    if (column.isPrimaryKey) {
      badges.push(
        <span key="pk" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          PK
        </span>
      );
    }
    
    if (column.isIdentity) {
      badges.push(
        <span key="identity" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          IDENTITY
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
      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
        isSelected
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-200 hover:border-gray-300'
      } ${isDragging ? 'shadow-lg border-blue-300' : ''}`}
      onClick={() => onSelect(column.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {/* 드래그 핸들 */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            <Bars3Icon className="w-4 h-4" />
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="text-sm font-medium text-gray-900">
                {column.name}
              </h4>
              <span className="text-sm text-gray-500">
                {getDataTypeDisplay(column)}
              </span>
              <div className="flex space-x-1">
                {getColumnBadges(column)}
              </div>
            </div>
            
            {column.description && (
              <p className="text-sm text-gray-600 mb-2">
                {column.description}
              </p>
            )}
            
            {column.defaultValue && (
              <p className="text-xs text-gray-500">
                기본값: {column.defaultValue}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1 ml-4">
          {/* 순서 변경 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={!canMoveUp}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="위로 이동"
          >
            <ArrowUpIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={!canMoveDown}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="아래로 이동"
          >
            <ArrowDownIcon className="h-4 w-4" />
          </button>

          {/* 복사 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(column);
            }}
            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            title="복사"
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
          </button>

          {/* 편집 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(column);
            }}
            className="p-1 text-gray-400 hover:text-indigo-600"
            title="편집"
          >
            <PencilIcon className="h-4 w-4" />
          </button>

          {/* 삭제 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // 기본키인 경우 추가 경고
              const confirmMessage = column.isPrimaryKey 
                ? `경고: "${column.name}"은(는) 기본키입니다.\n삭제하면 테이블 무결성에 영향을 줄 수 있습니다.\n정말 삭제하시겠습니까?`
                : `컬럼 "${column.name}"을(를) 삭제하시겠습니까?`;
              
              if (window.confirm(confirmMessage)) {
                onDelete(column.id);
              }
            }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="삭제"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ColumnList: React.FC<ColumnListProps> = ({
  columns,
  selectedColumnId,
  onSelectColumn,
  onEditColumn,
  onDeleteColumn,
  onDuplicateColumn,
  onAddColumn,
  onMoveColumn,
  onReorderColumns,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedColumns = [...columns].sort((a, b) => a.orderIndex - b.orderIndex);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over?.id) {
      const oldIndex = sortedColumns.findIndex((column) => column.id === active.id);
      const newIndex = sortedColumns.findIndex((column) => column.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newColumns = arrayMove(sortedColumns, oldIndex, newIndex);
        // orderIndex 업데이트
        const updatedColumns = newColumns.map((column, index) => ({
          ...column,
          orderIndex: index
        }));
        onReorderColumns(updatedColumns);
      }
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            컬럼 목록
          </h3>
          <button
            onClick={onAddColumn}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            컬럼 추가
          </button>
        </div>

        {sortedColumns.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">컬럼이 없습니다.</p>
            <p className="text-sm text-gray-400 mt-1">
              "컬럼 추가" 버튼을 클릭하여 새 컬럼을 추가하세요.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortedColumns.map(col => col.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sortedColumns.map((column, index) => (
                  <SortableColumnItem
                    key={column.id}
                    column={column}
                    index={index}
                    isSelected={selectedColumnId === column.id}
                    onSelect={onSelectColumn}
                    onEdit={onEditColumn}
                    onDelete={onDeleteColumn}
                    onDuplicate={onDuplicateColumn}
                    onMoveUp={() => onMoveColumn(column.id, 'up')}
                    onMoveDown={() => onMoveColumn(column.id, 'down')}
                    canMoveUp={index > 0}
                    canMoveDown={index < sortedColumns.length - 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default ColumnList;