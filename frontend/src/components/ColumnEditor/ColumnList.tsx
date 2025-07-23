import React from 'react';
import type { Column } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface ColumnListProps {
  columns: Column[];
  selectedColumnId?: string;
  onSelectColumn: (columnId: string) => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
  onAddColumn: () => void;
  onMoveColumn: (columnId: string, direction: 'up' | 'down') => void;
}

const ColumnList: React.FC<ColumnListProps> = ({
  columns,
  selectedColumnId,
  onSelectColumn,
  onEditColumn,
  onDeleteColumn,
  onAddColumn,
  onMoveColumn,
}) => {
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

  const sortedColumns = [...columns].sort((a, b) => a.orderIndex - b.orderIndex);

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
          <div className="space-y-2">
            {sortedColumns.map((column, index) => (
              <div
                key={column.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedColumnId === column.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onSelectColumn(column.id)}
              >
                <div className="flex items-center justify-between">
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

                  <div className="flex items-center space-x-1 ml-4">
                    {/* 순서 변경 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveColumn(column.id, 'up');
                      }}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="위로 이동"
                    >
                      <ArrowUpIcon className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveColumn(column.id, 'down');
                      }}
                      disabled={index === sortedColumns.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="아래로 이동"
                    >
                      <ArrowDownIcon className="h-4 w-4" />
                    </button>

                    {/* 편집 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditColumn(column);
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
                        if (window.confirm(`컬럼 "${column.name}"을(를) 삭제하시겠습니까?`)) {
                          onDeleteColumn(column.id);
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="삭제"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ColumnList;