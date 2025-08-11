import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Modal from '../common/Modal';
import { Button, ErrorMessage } from '../common';
import { useTableStore } from '../../stores/tableStore';
import { useProjectStore } from '../../stores/projectStore';
import { useValidationStore } from '../../stores/validationStore';
import type { Table, UpdateTableRequest, CreateTableRequest } from '../../types';

interface TableEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
  onSuccess?: (table: Table) => void;
  initialPosition?: { x: number; y: number };
}

interface TableFormData {
  name: string;
  description: string;
  positionX: number;
  positionY: number;
}

const TableEditModal: React.FC<TableEditModalProps> = ({
  isOpen,
  onClose,
  table,
  onSuccess,
  initialPosition = { x: 300, y: 200 },
}) => {
  const { updateTable, createTable, deleteTable, isLoading } = useTableStore();
  const { currentProject } = useProjectStore();
  const { validateTableName } = useValidationStore();
  
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TableFormData>({
    defaultValues: {
      name: '',
      description: '',
      positionX: initialPosition.x,
      positionY: initialPosition.y,
    },
  });

  const watchedName = watch('name');

  // 테이블 데이터로 폼 초기화
  useEffect(() => {
    if (table) {
      reset({
        name: table.name,
        description: table.description || '',
        positionX: table.positionX,
        positionY: table.positionY,
      });
    } else {
      reset({
        name: '',
        description: '',
        positionX: initialPosition.x,
        positionY: initialPosition.y,
      });
    }
  }, [table, reset, initialPosition]);

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

    setSubmitError(null);

    // 네이밍 규칙 검증
    if (validationErrors.length > 0) {
      setSubmitError('네이밍 규칙을 준수해야 합니다.');
      return;
    }

    try {
      let result: Table | null = null;

      if (table) {
        // 기존 테이블 업데이트
        const request: UpdateTableRequest = {
          name: data.name.trim(),
          description: data.description.trim() || undefined,
          positionX: data.positionX,
          positionY: data.positionY,
        };
        result = await updateTable(table.id, request);
      } else {
        // 새 테이블 생성
        const request: CreateTableRequest = {
          name: data.name.trim(),
          description: data.description.trim() || undefined,
          positionX: data.positionX,
          positionY: data.positionY,
        };
        result = await createTable(currentProject.id, request);
      }

      if (result) {
        onSuccess?.(result);
        handleClose();
      }
    } catch (error) {
      console.error('Table operation error:', error);
      setSubmitError(
        table 
          ? '테이블 수정 중 오류가 발생했습니다.' 
          : '테이블 생성 중 오류가 발생했습니다.'
      );
    }
  };

  const handleDelete = async () => {
    if (!table) return;

    try {
      const success = await deleteTable(table.id);
      if (success) {
        setShowDeleteConfirm(false);
        handleClose();
      }
    } catch (error) {
      console.error('Table delete error:', error);
      setSubmitError('테이블 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleClose = () => {
    onClose();
    reset();
    setValidationErrors([]);
    setSubmitError(null);
    setShowDeleteConfirm(false);
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
            className={`mt-1 block w-full rounded-xl border-2 bg-gradient-to-r from-white to-surface-50 px-4 py-3 text-surface-900 font-medium shadow-soft focus:border-primary-500 focus:ring-4 focus:ring-primary-200 focus:outline-none transition-all duration-200 hover:border-surface-400 hover:shadow-medium sm:text-sm ${
              errors.name || validationErrors.length > 0 ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-surface-300'
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
            className="mt-1 block w-full rounded-xl border-2 border-surface-300 bg-gradient-to-r from-white to-surface-50 px-4 py-3 text-surface-900 font-medium shadow-soft focus:border-primary-500 focus:ring-4 focus:ring-primary-200 focus:outline-none transition-all duration-200 hover:border-surface-400 hover:shadow-medium sm:text-sm"
            placeholder="테이블에 대한 설명을 입력하세요 (선택사항)"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* 위치 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="positionX" className="block text-sm font-medium text-gray-700">
              X 좌표
            </label>
            <input
              type="number"
              id="positionX"
              {...register('positionX', {
                required: 'X 좌표는 필수입니다.',
                min: {
                  value: 0,
                  message: 'X 좌표는 0 이상이어야 합니다.',
                },
                max: {
                  value: 5000,
                  message: 'X 좌표는 5000 이하여야 합니다.',
                },
              })}
              className="mt-1 block w-full rounded-xl border-2 border-surface-300 bg-gradient-to-r from-white to-surface-50 px-4 py-3 text-surface-900 font-medium shadow-soft focus:border-primary-500 focus:ring-4 focus:ring-primary-200 focus:outline-none transition-all duration-200 hover:border-surface-400 hover:shadow-medium sm:text-sm"
              placeholder="0"
            />
            {errors.positionX && (
              <p className="mt-1 text-sm text-red-600">{errors.positionX.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="positionY" className="block text-sm font-medium text-gray-700">
              Y 좌표
            </label>
            <input
              type="number"
              id="positionY"
              {...register('positionY', {
                required: 'Y 좌표는 필수입니다.',
                min: {
                  value: 0,
                  message: 'Y 좌표는 0 이상이어야 합니다.',
                },
                max: {
                  value: 5000,
                  message: 'Y 좌표는 5000 이하여야 합니다.',
                },
              })}
              className="mt-1 block w-full rounded-xl border-2 border-surface-300 bg-gradient-to-r from-white to-surface-50 px-4 py-3 text-surface-900 font-medium shadow-soft focus:border-primary-500 focus:ring-4 focus:ring-primary-200 focus:outline-none transition-all duration-200 hover:border-surface-400 hover:shadow-medium sm:text-sm"
              placeholder="0"
            />
            {errors.positionY && (
              <p className="mt-1 text-sm text-red-600">{errors.positionY.message}</p>
            )}
          </div>
        </div>

        {/* 테이블 정보 (편집 모드일 때만) */}
        {isEdit && table && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-900">테이블 정보</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">컬럼 수:</span>
                <span className="ml-2 font-medium">{table.columns?.length || 0}개</span>
              </div>
              <div>
                <span className="text-gray-500">인덱스 수:</span>
                <span className="ml-2 font-medium">{table.indexes?.length || 0}개</span>
              </div>
              <div>
                <span className="text-gray-500">생성일:</span>
                <span className="ml-2 font-medium">
                  {new Date(table.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <div>
                <span className="text-gray-500">수정일:</span>
                <span className="ml-2 font-medium">
                  {new Date(table.updatedAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {submitError && (
          <ErrorMessage message={submitError} />
        )}

        {/* 검증 상태 표시 */}
        {watchedName && (
          <div className="flex items-center space-x-2 text-sm">
            {validationErrors.length === 0 ? (
              <>
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-green-600">네이밍 규칙을 준수합니다</span>
              </>
            ) : (
              <>
                <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                <span className="text-red-600">네이밍 규칙 위반</span>
              </>
            )}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <div>
            {isEdit && (
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
              >
                테이블 삭제
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || validationErrors.length > 0}
              className="!bg-gradient-to-r !from-primary-600 !to-primary-700 !text-white font-bold px-8 py-3 hover:!from-primary-700 hover:!to-primary-800 disabled:!from-surface-400 disabled:!to-surface-500 disabled:!text-surface-200 shadow-medium hover:shadow-strong"
            >
              {isLoading ? '저장 중...' : isEdit ? '수정' : '생성'}
            </Button>
          </div>
        </div>
      </form>

      {/* 삭제 확인 다이얼로그 */}
      {showDeleteConfirm && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="테이블 삭제 확인"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-900">
                  테이블 <strong>"{table?.name}"</strong>을(를) 정말 삭제하시겠습니까?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  이 작업은 되돌릴 수 없으며, 테이블의 모든 컬럼과 인덱스가 함께 삭제됩니다.
                </p>
                {table?.columns && table.columns.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>삭제될 데이터:</strong>
                    </p>
                    <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                      <li>컬럼 {table.columns.length}개</li>
                      <li>인덱스 {table.indexes?.length || 0}개</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className="!bg-gradient-to-r !from-surface-100 !to-surface-200 !text-surface-700 font-medium px-6 py-2 hover:!from-surface-200 hover:!to-surface-300"
              >
                취소
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={isLoading}
                className="!bg-gradient-to-r !from-red-600 !to-red-700 !text-white font-bold px-6 py-2 hover:!from-red-700 hover:!to-red-800 disabled:!from-surface-400 disabled:!to-surface-500"
              >
                {isLoading ? '삭제 중...' : '삭제'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
};

export default TableEditModal;