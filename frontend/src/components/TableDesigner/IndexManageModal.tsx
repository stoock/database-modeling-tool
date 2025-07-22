import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import Modal from '../common/Modal';
import { useTableStore } from '../../stores/tableStore';
import { useProjectStore } from '../../stores/projectStore';
import { useValidationStore } from '../../stores/validationStore';
import type { Table, Index, CreateIndexRequest, IndexColumn, IndexType, SortOrder } from '../../types';

interface IndexManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: string | null;
}

interface IndexFormData {
  name: string;
  type: IndexType;
  isUnique: boolean;
  columns: IndexColumn[];
}

const IndexManageModal: React.FC<IndexManageModalProps> = ({
  isOpen,
  onClose,
  tableId,
}) => {
  const { getTableById, createIndex, deleteIndex, isLoading } = useTableStore();
  const { currentProject } = useProjectStore();
  const { validateIndexName } = useValidationStore();
  
  const [table, setTable] = useState<Table | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<Index | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IndexFormData>({
    defaultValues: {
      name: '',
      type: 'NONCLUSTERED',
      isUnique: false,
      columns: [],
    },
  });

  const watchedName = watch('name');
  const watchedColumns = watch('columns');

  // 테이블 정보 로드
  useEffect(() => {
    if (tableId) {
      const foundTable = getTableById(tableId);
      setTable(foundTable || null);
    }
  }, [tableId, getTableById]);

  // 실시간 네이밍 규칙 검증
  useEffect(() => {
    if (watchedName && currentProject?.namingRules) {
      const errors = validateIndexName(watchedName, currentProject.namingRules);
      setValidationErrors(errors.map(e => e.message));
    } else {
      setValidationErrors([]);
    }
  }, [watchedName, currentProject?.namingRules, validateIndexName]);

  // 새 인덱스 생성 시작
  const startCreating = () => {
    setIsCreating(true);
    setSelectedIndex(null);
    reset({
      name: '',
      type: 'NONCLUSTERED',
      isUnique: false,
      columns: [],
    });
  };

  // 인덱스 생성 취소
  const cancelCreating = () => {
    setIsCreating(false);
    reset();
    setValidationErrors([]);
  };

  // 컬럼 추가
  const addColumn = (columnId: string) => {
    const currentColumns = watchedColumns || [];
    if (!currentColumns.find(c => c.columnId === columnId)) {
      const newColumns = [...currentColumns, { columnId, order: 'ASC' as SortOrder }];
      setValue('columns', newColumns);
    }
  };

  // 컬럼 제거
  const removeColumn = (columnId: string) => {
    const currentColumns = watchedColumns || [];
    const newColumns = currentColumns.filter(c => c.columnId !== columnId);
    setValue('columns', newColumns);
  };

  // 컬럼 순서 변경
  const moveColumn = (columnId: string, direction: 'up' | 'down') => {
    const currentColumns = watchedColumns || [];
    const index = currentColumns.findIndex(c => c.columnId === columnId);
    if (index === -1) return;

    const newColumns = [...currentColumns];
    if (direction === 'up' && index > 0) {
      [newColumns[index], newColumns[index - 1]] = [newColumns[index - 1], newColumns[index]];
    } else if (direction === 'down' && index < newColumns.length - 1) {
      [newColumns[index], newColumns[index + 1]] = [newColumns[index + 1], newColumns[index]];
    }
    setValue('columns', newColumns);
  };

  // 컬럼 정렬 순서 변경
  const toggleColumnOrder = (columnId: string) => {
    const currentColumns = watchedColumns || [];
    const newColumns = currentColumns.map(c => 
      c.columnId === columnId 
        ? { ...c, order: c.order === 'ASC' ? 'DESC' as SortOrder : 'ASC' as SortOrder }
        : c
    );
    setValue('columns', newColumns);
  };

  // 인덱스 생성
  const onSubmit = async (data: IndexFormData) => {
    if (!tableId || !data.columns.length) return;

    const request: CreateIndexRequest = {
      name: data.name.trim(),
      type: data.type,
      isUnique: data.isUnique,
      columns: data.columns,
    };

    const result = await createIndex(tableId, request);
    if (result) {
      setIsCreating(false);
      reset();
      setValidationErrors([]);
      // 테이블 정보 새로고침
      const updatedTable = getTableById(tableId);
      setTable(updatedTable || null);
    }
  };

  // 인덱스 삭제
  const handleDeleteIndex = async (indexId: string) => {
    if (window.confirm('이 인덱스를 삭제하시겠습니까?')) {
      const success = await deleteIndex(indexId);
      if (success && tableId) {
        // 테이블 정보 새로고침
        const updatedTable = getTableById(tableId);
        setTable(updatedTable || null);
      }
    }
  };

  const getColumnName = (columnId: string) => {
    return table?.columns.find(c => c.id === columnId)?.name || 'Unknown';
  };

  const availableColumns = table?.columns.filter(c => 
    !watchedColumns?.find(ic => ic.columnId === c.id)
  ) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`인덱스 관리 - ${table?.name || ''}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* 기존 인덱스 목록 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">기존 인덱스</h4>
            <button
              onClick={startCreating}
              disabled={isCreating}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              새 인덱스
            </button>
          </div>

          {table?.indexes && table.indexes.length > 0 ? (
            <div className="space-y-3">
              {table.indexes.map((index) => (
                <div
                  key={index.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="font-medium text-gray-900">{index.name}</h5>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          index.type === 'CLUSTERED' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {index.type}
                        </span>
                        {index.isUnique && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            UNIQUE
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        컬럼: {index.columns.map(c => 
                          `${getColumnName(c.columnId)} (${c.order})`
                        ).join(', ')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteIndex(index.id)}
                      className="ml-4 p-1 text-gray-400 hover:text-red-600 rounded"
                      title="인덱스 삭제"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>생성된 인덱스가 없습니다.</p>
            </div>
          )}
        </div>

        {/* 새 인덱스 생성 폼 */}
        {isCreating && (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">새 인덱스 생성</h4>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 인덱스명 */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    인덱스명 *
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name', {
                      required: '인덱스명은 필수입니다.',
                      minLength: {
                        value: 1,
                        message: '인덱스명은 최소 1자 이상이어야 합니다.',
                      },
                    })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      errors.name || validationErrors.length > 0 ? 'border-red-300' : ''
                    }`}
                    placeholder="인덱스명을 입력하세요"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                  {validationErrors.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {validationErrors.map((error, index) => (
                        <p key={index} className="text-sm text-red-600">{error}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* 인덱스 타입 */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    인덱스 타입 *
                  </label>
                  <select
                    id="type"
                    {...register('type', { required: '인덱스 타입은 필수입니다.' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="NONCLUSTERED">NONCLUSTERED</option>
                    <option value="CLUSTERED">CLUSTERED</option>
                  </select>
                </div>
              </div>

              {/* 유니크 옵션 */}
              <div className="flex items-center">
                <input
                  id="isUnique"
                  type="checkbox"
                  {...register('isUnique')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isUnique" className="ml-2 block text-sm text-gray-900">
                  유니크 인덱스
                </label>
              </div>

              {/* 컬럼 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  인덱스 컬럼 *
                </label>
                
                {/* 사용 가능한 컬럼 */}
                {availableColumns.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">사용 가능한 컬럼:</p>
                    <div className="flex flex-wrap gap-2">
                      {availableColumns.map((column) => (
                        <button
                          key={column.id}
                          type="button"
                          onClick={() => addColumn(column.id)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <PlusIcon className="w-3 h-3 mr-1" />
                          {column.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 선택된 컬럼 */}
                {watchedColumns && watchedColumns.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">선택된 컬럼 (순서대로):</p>
                    {watchedColumns.map((indexColumn, index) => {
                      const column = table?.columns.find(c => c.id === indexColumn.columnId);
                      return (
                        <div
                          key={indexColumn.columnId}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900">
                              {index + 1}. {column?.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleColumnOrder(indexColumn.columnId)}
                              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                                indexColumn.order === 'ASC'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {indexColumn.order}
                            </button>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => moveColumn(indexColumn.columnId, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                              title="위로 이동"
                            >
                              <ArrowUpIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveColumn(indexColumn.columnId, 'down')}
                              disabled={index === watchedColumns.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                              title="아래로 이동"
                            >
                              <ArrowDownIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeColumn(indexColumn.columnId)}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="제거"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-md">
                    <p className="text-sm">인덱스에 포함할 컬럼을 선택하세요</p>
                  </div>
                )}
              </div>

              {/* 버튼 */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={cancelCreating}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading || validationErrors.length > 0 || !watchedColumns?.length}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '생성 중...' : '인덱스 생성'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default IndexManageModal;