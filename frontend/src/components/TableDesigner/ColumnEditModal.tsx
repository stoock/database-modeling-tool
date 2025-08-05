import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ExclamationTriangleIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import Modal from '../common/Modal';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import { useTableStore } from '../../stores/tableStore';
import { useProjectStore } from '../../stores/projectStore';
import { useValidationStore } from '../../stores/validationStore';
import type { Column, UpdateColumnRequest, CreateColumnRequest, MSSQLDataType } from '../../types';

interface ColumnEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  column: Column | null;
  onSuccess?: (column: Column) => void;
}

interface ColumnFormData {
  name: string;
  description: string;
  dataType: MSSQLDataType;
  maxLength: number | null;
  precision: number | null;
  scale: number | null;
  nullable: boolean;
  primaryKey: boolean;
  identity: boolean;
  identitySeed: number;
  identityIncrement: number;
  defaultValue: string;
}

const MSSQL_DATA_TYPES: MSSQLDataType[] = [
  'BIGINT', 'INT', 'SMALLINT', 'TINYINT', 'BIT',
  'DECIMAL', 'NUMERIC', 'MONEY', 'SMALLMONEY', 'FLOAT', 'REAL',
  'DATETIME', 'DATETIME2', 'SMALLDATETIME', 'DATE', 'TIME', 'DATETIMEOFFSET',
  'CHAR', 'VARCHAR', 'TEXT', 'NCHAR', 'NVARCHAR', 'NTEXT',
  'BINARY', 'VARBINARY', 'IMAGE',
  'UNIQUEIDENTIFIER', 'XML', 'JSON'
];

const ColumnEditModal: React.FC<ColumnEditModalProps> = ({
  isOpen,
  onClose,
  column,
  onSuccess
}) => {
  const { updateColumn, deleteColumn, createColumn, getTableById, isLoading } = useTableStore();
  const { currentProject } = useProjectStore();
  const { validateColumnName } = useValidationStore();
  
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ColumnFormData>({
    defaultValues: {
      name: '',
      description: '',
      dataType: 'VARCHAR',
      maxLength: null,
      precision: null,
      scale: null,
      nullable: true,
      primaryKey: false,
      identity: false,
      identitySeed: 1,
      identityIncrement: 1,
      defaultValue: '',
    },
  });

  const watchedName = watch('name');
  const watchedDataType = watch('dataType');
  const watchedIsPrimaryKey = watch('primaryKey');
  const watchedIsIdentity = watch('identity');

  // 컬럼 데이터로 폼 초기화
  useEffect(() => {
    if (column) {
      reset({
        name: column.name,
        description: column.description || '',
        dataType: column.dataType,
        maxLength: column.maxLength,
        precision: column.precision,
        scale: column.scale,
        nullable: column.nullable,
        primaryKey: column.primaryKey,
        identity: column.identity,
        identitySeed: column.identitySeed || 1,
        identityIncrement: column.identityIncrement || 1,
        defaultValue: column.defaultValue || '',
      });
    }
  }, [column, reset]);

  // 기본키 설정 시 자동으로 NOT NULL 설정
  useEffect(() => {
    if (watchedIsPrimaryKey) {
      setValue('nullable', false);
    }
  }, [watchedIsPrimaryKey, setValue]);

  // IDENTITY 설정 시 자동으로 정수 타입으로 변경
  useEffect(() => {
    if (watchedIsIdentity && !['BIGINT', 'INT', 'SMALLINT', 'TINYINT'].includes(watchedDataType)) {
      setValue('dataType', 'INT');
    }
  }, [watchedIsIdentity, watchedDataType, setValue]);

  // 실시간 네이밍 규칙 검증
  useEffect(() => {
    if (watchedName && currentProject?.namingRules) {
      const errors = validateColumnName(watchedName, currentProject.namingRules);
      setValidationErrors(errors.map(e => e.message));
    } else {
      setValidationErrors([]);
    }
  }, [watchedName, currentProject?.namingRules, validateColumnName]);

  // 데이터 타입에 따른 필드 표시 여부
  const needsLength = ['VARCHAR', 'NVARCHAR', 'CHAR', 'NCHAR', 'BINARY', 'VARBINARY'].includes(watchedDataType);
  const needsPrecision = ['DECIMAL', 'NUMERIC'].includes(watchedDataType);
  const canBeIdentity = ['BIGINT', 'INT', 'SMALLINT', 'TINYINT'].includes(watchedDataType);

  const onSubmit = async (data: ColumnFormData) => {
    if (!column) return;

    setSubmitError(null);

    // 네이밍 규칙 검증
    if (validationErrors.length > 0) {
      setSubmitError('네이밍 규칙을 준수해야 합니다.');
      return;
    }

    try {
      const request: UpdateColumnRequest = {
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        dataType: data.dataType,
        maxLength: needsLength ? data.maxLength || undefined : undefined,
        precision: needsPrecision ? data.precision || undefined : undefined,
        scale: needsPrecision ? data.scale || undefined : undefined,
        nullable: data.nullable,
        primaryKey: data.primaryKey,
        identity: data.identity,
        identitySeed: data.identity ? data.identitySeed : undefined,
        identityIncrement: data.identity ? data.identityIncrement : undefined,
        defaultValue: data.defaultValue.trim() || undefined,
      };

      const result = await updateColumn(column.id, request);
      if (result) {
        onSuccess?.(result);
        handleClose();
      }
    } catch (error) {
      setSubmitError('컬럼 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!column) return;

    try {
      const success = await deleteColumn(column.id);
      if (success) {
        setShowDeleteConfirm(false);
        handleClose();
      }
    } catch (error) {
      setSubmitError('컬럼 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDuplicate = async () => {
    if (!column) return;

    const table = getTableById(column.tableId);
    if (!table) return;

    try {
      const request: CreateColumnRequest = {
        name: `${column.name}_copy`,
        description: column.description,
        dataType: column.dataType,
        maxLength: column.maxLength,
        precision: column.precision,
        scale: column.scale,
        nullable: column.nullable,
        primaryKey: false, // 복사된 컬럼은 기본키가 될 수 없음
        identity: false, // 복사된 컬럼은 자동증가가 될 수 없음
        defaultValue: column.defaultValue,
        orderIndex: table.columns.length,
      };

      const result = await createColumn(column.tableId, request);
      if (result) {
        onSuccess?.(result);
        handleClose();
      }
    } catch (error) {
      setSubmitError('컬럼 복사 중 오류가 발생했습니다.');
    }
  };

  const handleClose = () => {
    onClose();
    reset({
      name: '',
      description: '',
      dataType: 'VARCHAR',
      maxLength: null,
      precision: null,
      scale: null,
      nullable: true,
      primaryKey: false,
      identity: false,
      identitySeed: 1,
      identityIncrement: 1,
      defaultValue: '',
    });
    setValidationErrors([]);
    setSubmitError(null);
    setShowDeleteConfirm(false);
  };
  
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="컬럼 편집"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {submitError && (
            <ErrorMessage message={submitError} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 컬럼명 */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                컬럼명 *
              </label>
              <input
                type="text"
                id="name"
                {...register('name', {
                  required: '컬럼명은 필수입니다.',
                  minLength: {
                    value: 1,
                    message: '컬럼명은 최소 1자 이상이어야 합니다.',
                  },
                  maxLength: {
                    value: 128,
                    message: '컬럼명은 최대 128자까지 입력할 수 있습니다.',
                  },
                })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.name || validationErrors.length > 0 ? 'border-red-300' : ''
                }`}
                placeholder="컬럼명을 입력하세요"
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

            {/* 데이터 타입 */}
            <div>
              <label htmlFor="dataType" className="block text-sm font-medium text-gray-700">
                데이터 타입 *
              </label>
              <select
                id="dataType"
                {...register('dataType', { required: '데이터 타입은 필수입니다.' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {MSSQL_DATA_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.dataType && (
                <p className="mt-1 text-sm text-red-600">{errors.dataType.message}</p>
              )}
            </div>

            {/* 길이 (문자열 타입) */}
            {needsLength && (
              <div>
                <label htmlFor="maxLength" className="block text-sm font-medium text-gray-700">
                  길이 *
                </label>
                <input
                  type="number"
                  id="maxLength"
                  min="1"
                  max="8000"
                  {...register('maxLength', {
                    required: needsLength ? '길이는 필수입니다.' : false,
                    min: { value: 1, message: '길이는 1 이상이어야 합니다.' },
                    max: { value: 8000, message: '길이는 8000 이하여야 합니다.' },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="예: 255"
                />
                {errors.maxLength && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxLength.message}</p>
                )}
              </div>
            )}

            {/* 정밀도 (DECIMAL, NUMERIC) */}
            {needsPrecision && (
              <>
                <div>
                  <label htmlFor="precision" className="block text-sm font-medium text-gray-700">
                    정밀도 *
                  </label>
                  <input
                    type="number"
                    id="precision"
                    min="1"
                    max="38"
                    {...register('precision', {
                      required: needsPrecision ? '정밀도는 필수입니다.' : false,
                      min: { value: 1, message: '정밀도는 1 이상이어야 합니다.' },
                      max: { value: 38, message: '정밀도는 38 이하여야 합니다.' },
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="예: 18"
                  />
                  {errors.precision && (
                    <p className="mt-1 text-sm text-red-600">{errors.precision.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="scale" className="block text-sm font-medium text-gray-700">
                    소수점 자릿수
                  </label>
                  <input
                    type="number"
                    id="scale"
                    min="0"
                    max="38"
                    {...register('scale', {
                      min: { value: 0, message: '소수점 자릿수는 0 이상이어야 합니다.' },
                      max: { value: 38, message: '소수점 자릿수는 38 이하여야 합니다.' },
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="예: 2"
                  />
                  {errors.scale && (
                    <p className="mt-1 text-sm text-red-600">{errors.scale.message}</p>
                  )}
                </div>
              </>
            )}

            {/* 기본값 */}
            <div className="md:col-span-2">
              <label htmlFor="defaultValue" className="block text-sm font-medium text-gray-700">
                기본값
              </label>
              <input
                type="text"
                id="defaultValue"
                {...register('defaultValue')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="기본값을 입력하세요 (선택사항)"
              />
            </div>

            {/* 설명 */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                설명
              </label>
              <textarea
                id="description"
                rows={2}
                {...register('description')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="컬럼에 대한 설명을 입력하세요 (선택사항)"
              />
            </div>
          </div>

          {/* 옵션 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">옵션</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NULL 허용 */}
              <div className="flex items-center">
                <input
                  id="isNullable"
                  type="checkbox"
                  {...register('nullable')}
                  disabled={watchedIsPrimaryKey}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <label htmlFor="isNullable" className="ml-2 block text-sm text-gray-900">
                  NULL 허용
                </label>
              </div>

              {/* 기본키 */}
              <div className="flex items-center">
                <input
                  id="isPrimaryKey"
                  type="checkbox"
                  {...register('primaryKey')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPrimaryKey" className="ml-2 block text-sm text-gray-900">
                  기본키
                </label>
              </div>

              {/* 자동증가 */}
              {canBeIdentity && (
                <div className="flex items-center">
                  <input
                    id="isIdentity"
                    type="checkbox"
                    {...register('identity')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isIdentity" className="ml-2 block text-sm text-gray-900">
                    자동증가 (IDENTITY)
                  </label>
                </div>
              )}
            </div>

            {/* IDENTITY 옵션 */}
            {watchedIsIdentity && (
              <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-blue-200">
                <div>
                  <label htmlFor="identitySeed" className="block text-sm font-medium text-gray-700">
                    시작값
                  </label>
                  <input
                    type="number"
                    id="identitySeed"
                    {...register('identitySeed', {
                      min: { value: 1, message: '시작값은 1 이상이어야 합니다.' },
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  {errors.identitySeed && (
                    <p className="mt-1 text-sm text-red-600">{errors.identitySeed.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="identityIncrement" className="block text-sm font-medium text-gray-700">
                    증가값
                  </label>
                  <input
                    type="number"
                    id="identityIncrement"
                    {...register('identityIncrement', {
                      min: { value: 1, message: '증가값은 1 이상이어야 합니다.' },
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  {errors.identityIncrement && (
                    <p className="mt-1 text-sm text-red-600">{errors.identityIncrement.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 컬럼 정보 (편집 모드일 때만) */}
          {column && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-900">컬럼 정보</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">순서:</span>
                  <span className="ml-2 font-medium">{column.orderIndex + 1}</span>
                </div>
                <div>
                  <span className="text-gray-500">ID:</span>
                  <span className="ml-2 font-mono text-xs">{column.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">생성일:</span>
                  <span className="ml-2 font-medium">
                    {new Date(column.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">수정일:</span>
                  <span className="ml-2 font-medium">
                    {new Date(column.updatedAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
              >
                삭제
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleDuplicate}
                disabled={isLoading}
              >
                <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                복사
              </Button>
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
                disabled={isLoading || validationErrors.length > 0}
              >
                {isLoading ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* 삭제 확인 다이얼로그 */}
      {showDeleteConfirm && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="컬럼 삭제 확인"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-900">
                  컬럼 <strong>"{column?.name}"</strong>을(를) 정말 삭제하시겠습니까?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  이 작업은 되돌릴 수 없습니다.
                </p>
                {column?.primaryKey && (
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
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
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

export default ColumnEditModal;