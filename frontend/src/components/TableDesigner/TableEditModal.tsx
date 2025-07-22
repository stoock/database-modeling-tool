import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import { useTableStore } from '../../stores/tableStore';
import { useProjectStore } from '../../stores/projectStore';
import { useValidationStore } from '../../stores/validationStore';
import type { Table, UpdateTableRequest } from '../../types';

interface TableEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
}

interface TableFormData {
  name: string;
  description: string;
}

const TableEditModal: React.FC<TableEditModalProps> = ({
  isOpen,
  onClose,
  table,
}) => {
  const { updateTable, createTable, isLoading } = useTableStore();
  const { currentProject } = useProjectStore();
  const { validateTableName } = useValidationStore();
  
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<TableFormData>({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const watchedName = watch('name');

  // 테이블 데이터로 폼 초기화
  useEffect(() => {
    if (table) {
      reset({
        name: table.name,
        description: table.description || '',
      });
    } else {
      reset({
        name: '',
        description: '',
      });
    }
  }, [table, reset]);

  // 실시간 네이밍 규칙 검증
  useEffect(() => {
    if (watchedName && currentProject?.namingRules) {
      const errors = validateTableName(watchedName, currentProject.namingRules);
      setValidationErrors(errors.map(e => e.message));
    } else {
      setValidationErrors([]);
    }
  }, [watchedName, currentProject?.namingRules, validateTableName]);

  const onSubmit = async (data: TableFormData) => {
    if (!currentProject) return;

    const request: UpdateTableRequest = {
      name: data.name.trim(),
      description: data.description.trim() || undefined,
    };

    let success = false;

    if (table) {
      // 기존 테이블 업데이트
      const result = await updateTable(table.id, request);
      success = result !== null;
    } else {
      // 새 테이블 생성
      const result = await createTable(currentProject.id, {
        ...request,
        positionX: 300,
        positionY: 200,
      });
      success = result !== null;
    }

    if (success) {
      onClose();
      reset();
    }
  };

  const handleClose = () => {
    onClose();
    reset();
    setValidationErrors([]);
  };

  const isEdit = !!table;
  const title = isEdit ? '테이블 편집' : '새 테이블 생성';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 테이블명 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            테이블명 *
          </label>
          <input
            type="text"
            id="name"
            {...register('name', {
              required: '테이블명은 필수입니다.',
              minLength: {
                value: 1,
                message: '테이블명은 최소 1자 이상이어야 합니다.',
              },
              maxLength: {
                value: 128,
                message: '테이블명은 최대 128자까지 입력할 수 있습니다.',
              },
            })}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.name || validationErrors.length > 0 ? 'border-red-300' : ''
            }`}
            placeholder="테이블명을 입력하세요"
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

        {/* 설명 */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            설명
          </label>
          <textarea
            id="description"
            rows={3}
            {...register('description', {
              maxLength: {
                value: 500,
                message: '설명은 최대 500자까지 입력할 수 있습니다.',
              },
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="테이블에 대한 설명을 입력하세요 (선택사항)"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isLoading || validationErrors.length > 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '저장 중...' : isEdit ? '수정' : '생성'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TableEditModal;