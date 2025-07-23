import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { Column, CreateColumnRequest, UpdateColumnRequest, MSSQLDataType } from '../../types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DataTypeSelector from './DataTypeSelector';

interface ColumnFormProps {
  column?: Column;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateColumnRequest | UpdateColumnRequest) => void;
  existingColumns: Column[];
}

interface ColumnFormData {
  name: string;
  description: string;
  dataType: MSSQLDataType;
  maxLength: number | null;
  precision: number | null;
  scale: number | null;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isIdentity: boolean;
  identitySeed: number | null;
  identityIncrement: number | null;
  defaultValue: string;
}

const ColumnForm: React.FC<ColumnFormProps> = ({
  column,
  isOpen,
  onClose,
  onSubmit,
  existingColumns,
}) => {
  const isEditMode = !!column;
  
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ColumnFormData>({
    defaultValues: {
      name: '',
      description: '',
      dataType: 'NVARCHAR',
      maxLength: null,
      precision: null,
      scale: null,
      isNullable: true,
      isPrimaryKey: false,
      isIdentity: false,
      identitySeed: null,
      identityIncrement: null,
      defaultValue: '',
    }
  });

  const watchedIsIdentity = watch('isIdentity');
  const watchedIsPrimaryKey = watch('isPrimaryKey');

  // 컬럼 데이터로 폼 초기화
  useEffect(() => {
    if (column) {
      reset({
        name: column.name,
        description: column.description || '',
        dataType: column.dataType,
        maxLength: column.maxLength || null,
        precision: column.precision || null,
        scale: column.scale || null,
        isNullable: column.isNullable,
        isPrimaryKey: column.isPrimaryKey,
        isIdentity: column.isIdentity,
        identitySeed: column.identitySeed || null,
        identityIncrement: column.identityIncrement || null,
        defaultValue: column.defaultValue || '',
      });
    } else {
      reset({
        name: '',
        description: '',
        dataType: 'NVARCHAR',
        maxLength: null,
        precision: null,
        scale: null,
        isNullable: true,
        isPrimaryKey: false,
        isIdentity: false,
        identitySeed: null,
        identityIncrement: null,
        defaultValue: '',
      });
    }
  }, [column, reset]);

  // 기본키 설정 시 자동으로 NOT NULL 설정
  useEffect(() => {
    if (watchedIsPrimaryKey) {
      setValue('isNullable', false);
    }
  }, [watchedIsPrimaryKey, setValue]);

  // IDENTITY 설정 시 기본값 설정
  useEffect(() => {
    if (watchedIsIdentity) {
      setValue('identitySeed', 1);
      setValue('identityIncrement', 1);
      setValue('defaultValue', '');
    } else {
      setValue('identitySeed', null);
      setValue('identityIncrement', null);
    }
  }, [watchedIsIdentity, setValue]);

  const onFormSubmit = (data: ColumnFormData) => {
    const nextOrderIndex = isEditMode 
      ? column!.orderIndex 
      : Math.max(0, ...existingColumns.map(c => c.orderIndex)) + 1;

    const submitData = {
      name: data.name.trim(),
      description: data.description.trim() || undefined,
      dataType: data.dataType,
      maxLength: data.maxLength || undefined,
      precision: data.precision || undefined,
      scale: data.scale || undefined,
      isNullable: data.isNullable,
      isPrimaryKey: data.isPrimaryKey,
      isIdentity: data.isIdentity,
      identitySeed: data.identitySeed || undefined,
      identityIncrement: data.identityIncrement || undefined,
      defaultValue: data.defaultValue.trim() || undefined,
      orderIndex: nextOrderIndex,
    };

    onSubmit(submitData);
  };

  const validateColumnName = (name: string) => {
    if (!name.trim()) {
      return '컬럼명은 필수입니다.';
    }
    
    const trimmedName = name.trim();
    const duplicateColumn = existingColumns.find(
      c => c.name.toLowerCase() === trimmedName.toLowerCase() && 
           (!isEditMode || c.id !== column!.id)
    );
    
    if (duplicateColumn) {
      return '이미 존재하는 컬럼명입니다.';
    }
    
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedName)) {
      return '컬럼명은 영문자, 숫자, 언더스코어만 사용할 수 있으며 숫자로 시작할 수 없습니다.';
    }
    
    return true;
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {isEditMode ? '컬럼 편집' : '새 컬럼 추가'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* 컬럼명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    컬럼명 *
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ validate: validateColumnName }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`block w-full border rounded-md px-3 py-2 text-sm ${
                          errors.name ? 'border-red-300' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                        placeholder="컬럼명을 입력하세요"
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* 설명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    설명
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={2}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="컬럼에 대한 설명을 입력하세요"
                      />
                    )}
                  />
                </div>

                {/* 데이터 타입 선택기 */}
                <DataTypeSelector
                  control={control}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                />

                {/* 체크박스 옵션들 */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Controller
                      name="isPrimaryKey"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={onChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      )}
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      기본키 (Primary Key)
                    </label>
                  </div>

                  <div className="flex items-center">
                    <Controller
                      name="isNullable"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={onChange}
                          disabled={watchedIsPrimaryKey}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                        />
                      )}
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      NULL 허용
                    </label>
                  </div>


                </div>



                {/* 기본값 */}
                {!watchedIsIdentity && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      기본값
                    </label>
                    <Controller
                      name="defaultValue"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="예: 'DEFAULT_VALUE' 또는 0"
                        />
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {isSubmitting ? '저장 중...' : (isEditMode ? '수정' : '추가')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ColumnForm;