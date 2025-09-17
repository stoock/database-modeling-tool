import React, { useState, useEffect } from 'react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  XMarkIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import { useTableStore } from '../../stores/tableStore';
import { useValidationStore } from '../../stores/validationStore';
import { useProjectStore } from '../../stores/projectStore';
import type { Index, IndexColumn, Column, Table, CreateIndexRequest, UpdateIndexRequest } from '../../types';
import IndexPerformancePanel from './IndexPerformancePanel';
import IndexSqlPreview from './IndexSqlPreview';

interface IndexFormProps {
  tableId: string;
  index: Index | null;
  columns: Column[];
  onCancel: () => void;
  onSuccess: () => void;
}

const IndexForm: React.FC<IndexFormProps> = ({
  tableId,
  index,
  columns,
  onCancel,
  onSuccess
}) => {
  const { createIndex, updateIndex, getTableById } = useTableStore();
  const { validateIndexName } = useValidationStore();
  const { currentProject } = useProjectStore();
  
  const [name, setName] = useState('');
  const [type, setType] = useState<'CLUSTERED' | 'NONCLUSTERED'>('NONCLUSTERED');
  const [isUnique, setIsUnique] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<IndexColumn[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameErrors, setNameErrors] = useState<string[]>([]);
  const [table, setTable] = useState<Table | undefined>();
  
  // 테이블 정보 로드
  useEffect(() => {
    const currentTable = getTableById(tableId);
    setTable(currentTable);
  }, [tableId, getTableById]);
  
  // 인덱스 데이터로 폼 초기화
  useEffect(() => {
    if (index) {
      setName(index.name);
      setType(index.type);
      setIsUnique(index.isUnique);
      setSelectedColumns([...(index.columns || [])]);
    } else {
      // 새 인덱스 기본값 - 더 스마트한 이름 생성
      if (table && columns.length > 0) {
        const tableName = table.name;
        const timestamp = Date.now().toString().slice(-4);
        setName(`IX_${tableName}_${timestamp}`);
      } else {
        setName('IX_NewIndex');
      }
      setType('NONCLUSTERED');
      setIsUnique(false);
      setSelectedColumns([]);
    }
  }, [index, columns, table]);
  
  // 이름 변경 시 검증
  useEffect(() => {
    if (name && currentProject?.namingRules) {
      const errors = validateIndexName(name, currentProject.namingRules);
      setNameErrors(errors.map(e => e.message));
    } else {
      setNameErrors([]);
    }
  }, [name, currentProject?.namingRules, validateIndexName]);
  
  // 컬럼 선택 처리
  const handleColumnSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const columnId = e.target.value;
    if (!columnId) return;
    
    // 이미 선택된 컬럼인지 확인
    if (selectedColumns.some(c => c.columnId === columnId)) {
      return;
    }
    
    setSelectedColumns([
      ...selectedColumns,
      { columnId, order: 'ASC' }
    ]);
    
    // 선택 후 셀렉트 박스 초기화
    e.target.value = '';
  };
  
  // 선택된 컬럼 제거
  const handleRemoveColumn = (columnId: string) => {
    setSelectedColumns(selectedColumns.filter(c => c.columnId !== columnId));
  };
  
  // 컬럼 순서 변경
  const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === selectedColumns.length - 1)
    ) {
      return;
    }
    
    const newColumns = [...selectedColumns];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newColumns[index], newColumns[newIndex]] = [newColumns[newIndex], newColumns[index]];
    setSelectedColumns(newColumns);
  };
  
  // 정렬 순서 변경
  const handleToggleSortOrder = (index: number) => {
    const newColumns = [...selectedColumns];
    newColumns[index] = {
      ...newColumns[index],
      order: newColumns[index].order === 'ASC' ? 'DESC' : 'ASC'
    };
    setSelectedColumns(newColumns);
  };
  
  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedColumns.length === 0) {
      setError('인덱스에는 최소 하나의 컬럼이 필요합니다.');
      return;
    }
    
    // 클러스터드 인덱스 중복 검증
    if (type === 'CLUSTERED' && table) {
      const existingClusteredIndex = table.indexes.find(
        idx => idx.type === 'CLUSTERED' && (!index || idx.id !== index.id)
      );
      
      if (existingClusteredIndex) {
        setError(`클러스터드 인덱스는 테이블당 하나만 생성할 수 있습니다. 기존 인덱스: ${existingClusteredIndex.name}`);
        return;
      }
    }
    
    // 인덱스명 중복 검증
    if (table) {
      const duplicateIndex = table.indexes.find(
        idx => idx.name.toLowerCase() === name.toLowerCase() && (!index || idx.id !== index.id)
      );
      
      if (duplicateIndex) {
        setError(`이미 존재하는 인덱스명입니다: ${duplicateIndex.name}`);
        return;
      }
    }
    
    // 명명 규칙 검증
    if (nameErrors.length > 0) {
      setError(`인덱스명이 명명 규칙을 위반합니다: ${nameErrors[0]}`);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (index) {
        // 인덱스 업데이트
        const request: UpdateIndexRequest = {
          name,
          type,
          isUnique,
          columns: selectedColumns
        };
        await updateIndex(index.id, request);
      } else {
        // 새 인덱스 생성
        const request: CreateIndexRequest = {
          name,
          type,
          isUnique,
          columns: selectedColumns
        };
        await createIndex(tableId, request);
      }
      
      onSuccess();
    } catch (err: unknown) {
      console.error('인덱스 저장 실패:', err);
      
      // 구체적인 오류 메시지 제공
      const errorObj = err as { code?: string; message?: string; status?: number };
      if (errorObj?.status === 400) {
        setError('입력된 인덱스 정보가 올바르지 않습니다. 다시 확인해주세요.');
      } else if (errorObj?.status === 409) {
        setError('인덱스 충돌이 발생했습니다. 다른 이름을 사용하거나 기존 인덱스를 확인해주세요.');
      } else if (errorObj?.code === 'NETWORK_ERROR') {
        setError('네트워크 연결을 확인하고 다시 시도해주세요.');
      } else {
        setError(`인덱스 저장에 실패했습니다: ${errorObj?.message || '알 수 없는 오류'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 컬럼 이름 조회
  const getColumnName = (columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    return column ? column.name : '알 수 없는 컬럼';
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          {index ? '인덱스 편집' : '새 인덱스 생성'}
        </h3>
        
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        
        {/* 인덱스 이름 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            인덱스 이름 <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`block w-full rounded-md border ${
                nameErrors.length > 0 ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
            />
          </div>
          {nameErrors.length > 0 && (
            <div className="mt-1 text-sm text-red-600">
              {nameErrors[0]}
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            권장 형식: IX_테이블명_컬럼명
          </p>
        </div>
        
        {/* 인덱스 타입 */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            인덱스 타입
          </label>
          <div className="mt-1">
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as 'CLUSTERED' | 'NONCLUSTERED')}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="CLUSTERED">클러스터드 인덱스</option>
              <option value="NONCLUSTERED">논클러스터드 인덱스</option>
            </select>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            클러스터드 인덱스는 테이블당 하나만 가능합니다.
          </p>
        </div>
        
        {/* 유니크 제약조건 */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isUnique"
            checked={isUnique}
            onChange={(e) => setIsUnique(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isUnique" className="ml-2 block text-sm text-gray-700">
            유니크 인덱스 (중복 값 허용 안함)
          </label>
        </div>
        
        {/* 컬럼 선택 */}
        <div>
          <label htmlFor="column" className="block text-sm font-medium text-gray-700">
            컬럼 추가
          </label>
          <div className="mt-1">
            <select
              id="column"
              onChange={handleColumnSelect}
              defaultValue=""
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="" disabled>
                -- 컬럼 선택 --
              </option>
              {columns
                .filter(column => !selectedColumns.some(c => c.columnId === column.id))
                .map(column => (
                  <option key={column.id} value={column.id}>
                    {column.name} ({column.dataType})
                  </option>
                ))}
            </select>
          </div>
        </div>
        
        {/* 선택된 컬럼 목록 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            선택된 컬럼
          </label>
          
          {selectedColumns.length === 0 ? (
            <div className="text-center py-4 border border-dashed border-gray-300 rounded-md">
              <p className="text-sm text-gray-500">
                선택된 컬럼이 없습니다. 위에서 컬럼을 선택해주세요.
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      순서
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      컬럼명
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      정렬
                    </th>
                    <th scope="col" className="relative px-4 py-2">
                      <span className="sr-only">작업</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedColumns.map((column, idx) => (
                    <tr key={column.columnId}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <span className="font-mono">{idx + 1}</span>
                          <div className="flex flex-col">
                            <button
                              type="button"
                              onClick={() => handleMoveColumn(idx, 'up')}
                              disabled={idx === 0}
                              className={`p-0.5 ${
                                idx === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600'
                              }`}
                            >
                              <ArrowUpIcon className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveColumn(idx, 'down')}
                              disabled={idx === selectedColumns.length - 1}
                              className={`p-0.5 ${
                                idx === selectedColumns.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600'
                              }`}
                            >
                              <ArrowDownIcon className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {getColumnName(column.columnId)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <button
                          type="button"
                          onClick={() => handleToggleSortOrder(idx)}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                        >
                          {column.order === 'ASC' ? (
                            <>
                              <ArrowUpIcon className="h-3 w-3 mr-1" />
                              오름차순
                            </>
                          ) : (
                            <>
                              <ArrowDownIcon className="h-3 w-3 mr-1" />
                              내림차순
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => handleRemoveColumn(column.columnId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XMarkIcon className="h-4 w-4" />
                          <span className="sr-only">제거</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {selectedColumns.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              복합 인덱스의 경우 컬럼 순서가 성능에 영향을 미칩니다.
            </p>
          )}
        </div>
      </div>
      
      {/* 성능 분석 및 SQL 미리보기 */}
      {selectedColumns.length > 0 && table && (
        <>
          <IndexPerformancePanel
            index={{
              id: index?.id || 'preview',
              tableId,
              name,
              type,
              isUnique,
              columns: selectedColumns,
              createdAt: new Date(),
              updatedAt: new Date()
            }}
            table={table}
          />
          
          <IndexSqlPreview
            index={{
              id: index?.id || 'preview',
              tableId,
              name,
              type,
              isUnique,
              columns: selectedColumns,
              createdAt: new Date(),
              updatedAt: new Date()
            }}
            table={table}
          />
        </>
      )}
      
      <div className="flex justify-end space-x-3 mt-6">
        <Button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          variant="outline"
          size="md"
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || selectedColumns.length === 0}
          variant="primary"
          size="md"
          loading={isSubmitting}
        >
          {index ? '인덱스 수정' : '인덱스 생성'}
        </Button>
      </div>
    </form>
  );
};

export default IndexForm;