import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTableStore } from '../../stores/tableStore';
import type { Column, MSSQLDataType } from '../../types';

interface ColumnEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  column: Column | null;
}

const ColumnEditModal: React.FC<ColumnEditModalProps> = ({
  isOpen,
  onClose,
  column
}) => {
  const { updateColumn, deleteColumn } = useTableStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dataType, setDataType] = useState<MSSQLDataType>('NVARCHAR');
  const [maxLength, setMaxLength] = useState<number | undefined>(undefined);
  const [precision, setPrecision] = useState<number | undefined>(undefined);
  const [scale, setScale] = useState<number | undefined>(undefined);
  const [isNullable, setIsNullable] = useState(true);
  const [isPrimaryKey, setIsPrimaryKey] = useState(false);
  const [isIdentity, setIsIdentity] = useState(false);
  const [identitySeed, setIdentitySeed] = useState<number | undefined>(1);
  const [identityIncrement, setIdentityIncrement] = useState<number | undefined>(1);
  const [defaultValue, setDefaultValue] = useState<string | undefined>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 컬럼 데이터로 폼 초기화
  useEffect(() => {
    if (column) {
      setName(column.name);
      setDescription(column.description || '');
      setDataType(column.dataType);
      setMaxLength(column.maxLength);
      setPrecision(column.precision);
      setScale(column.scale);
      setIsNullable(column.isNullable);
      setIsPrimaryKey(column.isPrimaryKey);
      setIsIdentity(column.isIdentity);
      setIdentitySeed(column.identitySeed);
      setIdentityIncrement(column.identityIncrement);
      setDefaultValue(column.defaultValue);
    }
  }, [column]);
  
  // 데이터 타입에 따라 추가 필드 표시 여부 결정
  const showLengthField = ['VARCHAR', 'NVARCHAR', 'CHAR', 'NCHAR', 'BINARY', 'VARBINARY'].includes(dataType);
  const showPrecisionField = ['DECIMAL', 'NUMERIC', 'FLOAT'].includes(dataType);
  
  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!column) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await updateColumn(column.id, {
        name,
        description: description || undefined,
        dataType,
        maxLength: showLengthField ? maxLength : undefined,
        precision: showPrecisionField ? precision : undefined,
        scale: showPrecisionField ? scale : undefined,
        isNullable,
        isPrimaryKey,
        isIdentity,
        identitySeed: isIdentity ? identitySeed : undefined,
        identityIncrement: isIdentity ? identityIncrement : undefined,
        defaultValue: defaultValue || undefined
      });
      
      onClose();
    } catch (err) {
      setError('컬럼 업데이트 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 컬럼 삭제 처리
  const handleDelete = async () => {
    if (!column) return;
    
    if (window.confirm(`컬럼 "${column.name}"을(를) 삭제하시겠습니까?`)) {
      setIsSubmitting(true);
      
      try {
        await deleteColumn(column.id);
        onClose();
      } catch (err) {
        setError('컬럼 삭제 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // MSSQL 데이터 타입 목록
  const dataTypes: MSSQLDataType[] = [
    'BIGINT', 'INT', 'SMALLINT', 'TINYINT', 'BIT',
    'DECIMAL', 'NUMERIC', 'MONEY', 'SMALLMONEY', 'FLOAT', 'REAL',
    'DATETIME', 'DATETIME2', 'SMALLDATETIME', 'DATE', 'TIME', 'DATETIMEOFFSET', 'TIMESTAMP',
    'CHAR', 'VARCHAR', 'TEXT', 'NCHAR', 'NVARCHAR', 'NTEXT',
    'BINARY', 'VARBINARY', 'IMAGE', 'UNIQUEIDENTIFIER', 'XML', 'JSON'
  ];
  
  return (
    <Dialog
      open={isOpen}
      onClose={() => !isSubmitting && onClose()}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              컬럼 편집
            </Dialog.Title>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              {/* 컬럼 이름 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  컬럼 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              {/* 설명 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  설명
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              {/* 데이터 타입 */}
              <div>
                <label htmlFor="dataType" className="block text-sm font-medium text-gray-700">
                  데이터 타입 <span className="text-red-500">*</span>
                </label>
                <select
                  id="dataType"
                  value={dataType}
                  onChange={(e) => setDataType(e.target.value as MSSQLDataType)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                  {dataTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* 길이 (특정 타입만) */}
              {showLengthField && (
                <div>
                  <label htmlFor="maxLength" className="block text-sm font-medium text-gray-700">
                    최대 길이
                  </label>
                  <input
                    type="number"
                    id="maxLength"
                    value={maxLength || ''}
                    onChange={(e) => setMaxLength(e.target.value ? parseInt(e.target.value) : undefined)}
                    min={1}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              )}
              
              {/* 정밀도/스케일 (특정 타입만) */}
              {showPrecisionField && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="precision" className="block text-sm font-medium text-gray-700">
                      정밀도
                    </label>
                    <input
                      type="number"
                      id="precision"
                      value={precision || ''}
                      onChange={(e) => setPrecision(e.target.value ? parseInt(e.target.value) : undefined)}
                      min={1}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="scale" className="block text-sm font-medium text-gray-700">
                      스케일
                    </label>
                    <input
                      type="number"
                      id="scale"
                      value={scale || ''}
                      onChange={(e) => setScale(e.target.value ? parseInt(e.target.value) : undefined)}
                      min={0}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              )}
              
              {/* 기본값 */}
              <div>
                <label htmlFor="defaultValue" className="block text-sm font-medium text-gray-700">
                  기본값
                </label>
                <input
                  type="text"
                  id="defaultValue"
                  value={defaultValue || ''}
                  onChange={(e) => setDefaultValue(e.target.value || undefined)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              {/* 체크박스 옵션들 */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isNullable"
                    checked={isNullable}
                    onChange={(e) => setIsNullable(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isNullable" className="ml-2 block text-sm text-gray-700">
                    NULL 허용
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrimaryKey"
                    checked={isPrimaryKey}
                    onChange={(e) => {
                      setIsPrimaryKey(e.target.checked);
                      if (e.target.checked) {
                        setIsNullable(false);
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isPrimaryKey" className="ml-2 block text-sm text-gray-700">
                    기본 키
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isIdentity"
                    checked={isIdentity}
                    onChange={(e) => setIsIdentity(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isIdentity" className="ml-2 block text-sm text-gray-700">
                    자동 증가
                  </label>
                </div>
              </div>
              
              {/* 자동 증가 옵션 */}
              {isIdentity && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="identitySeed" className="block text-sm font-medium text-gray-700">
                      시작값
                    </label>
                    <input
                      type="number"
                      id="identitySeed"
                      value={identitySeed || 1}
                      onChange={(e) => setIdentitySeed(parseInt(e.target.value))}
                      min={1}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="identityIncrement" className="block text-sm font-medium text-gray-700">
                      증가값
                    </label>
                    <input
                      type="number"
                      id="identityIncrement"
                      value={identityIncrement || 1}
                      onChange={(e) => setIdentityIncrement(parseInt(e.target.value))}
                      min={1}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="inline-flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                삭제
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ColumnEditModal;