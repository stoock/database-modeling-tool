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
  dataType: MSSQLDataType;
  maxLength?: number;
  precision?: number;
  scale?: number;
  nullable: boolean;
  primaryKey: boolean;
  identity: boolean;
  defaultValue?: string;
  description?: string;
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
    formState: { errors, isSubmitting, touchedFields }
  } = useForm<ColumnFormData>({
    mode: 'onChange', // 실시간 검증 활성화
    defaultValues: {
      name: '',
      description: '',
      dataType: 'NVARCHAR',
      maxLength: undefined,
      precision: undefined,
      scale: undefined,
      nullable: true,
      primaryKey: false,
      identity: false,
      defaultValue: '',
    }
  });

  const watchedIsIdentity = watch('identity');
  const watchedIsPrimaryKey = watch('primaryKey');

  // 컬럼 데이터로 폼 초기화
  useEffect(() => {
    if (column) {
      reset({
        name: column.name,
        description: column.description || '',
        dataType: column.dataType,
        maxLength: column.maxLength || undefined,
        precision: column.precision || undefined,
        scale: column.scale || undefined,
        nullable: column.nullable,
        primaryKey: column.primaryKey,
        identity: column.identity,
        defaultValue: column.defaultValue || '',
      });
    } else {
      reset({
        name: '',
        description: '',
        dataType: 'NVARCHAR',
        maxLength: undefined,
        precision: undefined,
        scale: undefined,
        nullable: true,
        primaryKey: false,
        identity: false,
        defaultValue: '',
      });
    }
  }, [column, reset]);

  // 기본키 설정 시 자동으로 NOT NULL 설정
  useEffect(() => {
    if (watchedIsPrimaryKey) {
      setValue('nullable', false);
    }
  }, [watchedIsPrimaryKey, setValue]);

  // IDENTITY 설정 시 기본값 설정
  useEffect(() => {
    if (watchedIsIdentity) {
      setValue('defaultValue', '');
    }
    // identitySeed/identityIncrement는 ColumnFormData에 없어서 제거
  }, [watchedIsIdentity, setValue]);

  const onFormSubmit = (data: ColumnFormData) => {
    const nextOrderIndex = isEditMode 
      ? column!.orderIndex 
      : Math.max(0, ...existingColumns.map(c => c.orderIndex)) + 1;

    const submitData = {
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      dataType: data.dataType,
      maxLength: data.maxLength || undefined,
      precision: data.precision || undefined,
      scale: data.scale || undefined,
      nullable: data.nullable,
      primaryKey: data.primaryKey,
      identity: data.identity,
      // identitySeed/identityIncrement는 ColumnFormData에 없음
      defaultValue: data.defaultValue?.trim() || undefined,
      orderIndex: nextOrderIndex,
    };

    onSubmit(submitData);
  };

  const validateColumnName = (name: string) => {
    if (!name || !name.trim()) {
      return '컬럼명은 필수입니다.';
    }
    
    const trimmedName = name.trim();
    
    // 길이 검사
    if (trimmedName.length === 0) {
      return '컬럼명은 필수입니다.';
    }
    
    if (trimmedName.length > 128) {
      return '컬럼명은 128자를 초과할 수 없습니다.';
    }
    
    // 패턴 검사
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedName)) {
      return '컬럼명은 영문자나 언더스코어로 시작하고, 영문자, 숫자, 언더스코어만 사용할 수 있습니다.';
    }
    
    // SQL 예약어 검사
    const reservedWords = [
      'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FROM', 'WHERE', 'ORDER', 'GROUP', 
      'HAVING', 'UNION', 'CREATE', 'ALTER', 'DROP', 'INDEX', 'TABLE', 'DATABASE', 
      'COLUMN', 'PRIMARY', 'FOREIGN', 'KEY', 'CONSTRAINT', 'NULL', 'NOT', 'DEFAULT', 
      'AUTO_INCREMENT', 'IDENTITY', 'UNIQUE', 'CHECK', 'REFERENCES', 'CASCADE'
    ];
    
    if (reservedWords.includes(trimmedName.toUpperCase())) {
      return 'SQL 예약어는 컬럼명으로 사용할 수 없습니다.';
    }
    
    // 중복 검사
    const duplicateColumn = existingColumns.find(
      c => c.name.toLowerCase() === trimmedName.toLowerCase() && 
           (!isEditMode || c.id !== column?.id)
    );
    
    if (duplicateColumn) {
      return '이미 존재하는 컬럼명입니다.';
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
                    <div className="mt-1">
                      <p className="text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.name.message}
                      </p>
                    </div>
                  )}
                  {!errors.name && touchedFields.name && (
                    <div className="mt-1">
                      <p className="text-sm text-green-600 flex items-center">
                        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        유효한 컬럼명입니다.
                      </p>
                    </div>
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
                  touchedFields={touchedFields}
                />

                {/* 체크박스 옵션들 */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Controller
                      name="primaryKey"
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
                      name="nullable"
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