import React from 'react';
import { 
  PencilIcon, 
  TrashIcon,
  KeyIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import { useTableStore } from '../../stores/tableStore';
import type { Index, Column } from '../../types';

interface IndexListProps {
  indexes: Index[];
  columns: Column[];
  onEdit: (index: Index) => void;
  onSelect?: (index: Index) => void;
  onDelete?: (deletedIndexId: string) => void;
  selectedIndexId?: string;
}

const IndexList: React.FC<IndexListProps> = ({
  indexes,
  columns,
  onEdit,
  onSelect,
  onDelete,
  selectedIndexId
}) => {
  const { deleteIndex } = useTableStore();
  
  // 인덱스 삭제 처리
  const handleDelete = async (index: Index) => {
    if (window.confirm(`인덱스 "${index.name}"을(를) 삭제하시겠습니까?`)) {
      try {
        await deleteIndex(index.id);
        onDelete?.(index.id); // 부모 컴포넌트에 삭제 알림
      } catch (error) {
        console.error('인덱스 삭제 중 오류 발생:', error);
      }
    }
  };
  
  // 인덱스 컬럼 이름 조회
  const getColumnName = (columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    return column ? column.name : '알 수 없는 컬럼';
  };
  
  // 인덱스 타입 표시 형식
  const formatIndexType = (type: string) => {
    return type === 'CLUSTERED' ? '클러스터드' : '논클러스터드';
  };
  
  // 정렬 순서 표시 형식
  const formatSortOrder = (order: string) => {
    return order === 'ASC' ? '오름차순' : '내림차순';
  };
  
  if (indexes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <TableCellsIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-lg">인덱스가 없습니다</p>
        <p className="text-sm mt-1">새 인덱스를 추가해보세요</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              인덱스명
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              타입
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              컬럼
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              유니크
            </th>
            <th scope="col" className="relative px-4 py-3">
              <span className="sr-only">작업</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {indexes.map((index) => (
            <tr 
              key={index.id} 
              className={`cursor-pointer transition-colors ${
                selectedIndexId === index.id 
                  ? 'bg-blue-50 border-l-4 border-blue-500' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelect?.(index)}
            >
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {index.name}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  index.type === 'CLUSTERED' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {formatIndexType(index.type)}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                <div className="space-y-1">
                  {index.columns.map((col, idx) => (
                    <div key={`${index.id}-${col.columnId}`} className="flex items-center">
                      <span className="text-xs font-mono bg-gray-100 px-1 rounded mr-1">
                        {idx + 1}
                      </span>
                      <span>{getColumnName(col.columnId)}</span>
                      <span className="text-xs text-gray-400 ml-1">
                        ({formatSortOrder(col.order)})
                      </span>
                    </div>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {index.isUnique ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <KeyIcon className="h-3 w-3 mr-1" />
                    유니크
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onEdit(index)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span className="sr-only">편집</span>
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span className="sr-only">삭제</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IndexList;