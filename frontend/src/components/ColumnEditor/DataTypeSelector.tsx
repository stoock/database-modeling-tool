import React from 'react';
import { Controller } from 'react-hook-form';
import type { Control, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import type { MSSQLDataType } from '../../types';

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

interface DataTypeSelectorProps {
  control: Control<ColumnFormData>;
  watch: UseFormWatch<ColumnFormData>;
  setValue: UseFormSetValue<ColumnFormData>;
  errors: FieldErrors<ColumnFormData>;
}

interface DataTypeInfo {
  category: string;
  description: string;
  needsLength: boolean;
  needsPrecisionScale: boolean;
  canBeIdentity: boolean;
  defaultLength?: number;
  defaultPrecision?: number;
  defaultScale?: number;
  maxLength?: number;
  maxPrecision?: number;
  maxScale?: number;
}

const DATA_TYPE_INFO: Record<MSSQLDataType, DataTypeInfo> = {
  // 정수형
  BIGINT: {
    category: '정수형',
    description: '8바이트 정수 (-9,223,372,036,854,775,808 ~ 9,223,372,036,854,775,807)',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: true,
  },
  INT: {
    category: '정수형',
    description: '4바이트 정수 (-2,147,483,648 ~ 2,147,483,647)',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: true,
  },
  SMALLINT: {
    category: '정수형',
    description: '2바이트 정수 (-32,768 ~ 32,767)',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: true,
  },
  TINYINT: {
    category: '정수형',
    description: '1바이트 정수 (0 ~ 255)',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: true,
  },
  BIT: {
    category: '정수형',
    description: '불린 값 (0 또는 1)',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: false,
  },

  // 소수형
  DECIMAL: {
    category: '소수형',
    description: '고정 소수점 숫자',
    needsLength: false,
    needsPrecisionScale: true,
    canBeIdentity: false,
    defaultPrecision: 18,
    defaultScale: 2,
    maxPrecision: 38,
    maxScale: 38,
  },
  NUMERIC: {
    category: '소수형',
    description: 'DECIMAL과 동일한 고정 소수점 숫자',
    needsLength: false,
    needsPrecisionScale: true,
    canBeIdentity: false,
    defaultPrecision: 18,
    defaultScale: 2,
    maxPrecision: 38,
    maxScale: 38,
  },
  MONEY: {
    category: '소수형',
    description: '8바이트 통화 데이터 타입',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: false,
  },
  SMALLMONEY: {
    category: '소수형',
    description: '4바이트 통화 데이터 타입',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: false,
  },
  FLOAT: {
    category: '소수형',
    description: '부동 소수점 숫자',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: false,
  },
  REAL: {
    category: '소수형',
    description: '4바이트 부동 소수점 숫자',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: false,
  },

  // 문자형
  CHAR: {
    category: '문자형',
    description: '고정 길이 문자열 (ANSI)',
    needsLength: true,
    needsPrecisionScale: false,
    canBeIdentity: false,
    defaultLength: 10,
    maxLength: 8000,
  },
  VARCHAR: {
    category: '문자형',
    description: '가변 길이 문자열 (ANSI)',
    needsLength: true,
    needsPrecisionScale: false,
    canBeIdentity: false,
    defaultLength: 255,
    maxLength: 8000,
  },
  TEXT: {
    category: '문자형',
    description: '가변 길이 대용량 문자열 (ANSI) - 사용 권장하지 않음',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: false,
  },
  NCHAR: {
    category: '문자형',
    description: '고정 길이 유니코드 문자열',
    needsLength: true,
    needsPrecisionScale: false,
    canBeIdentity: false,
    defaultLength: 10,
    maxLength: 4000,
  },
  NVARCHAR: {
    category: '문자형',
    description: '가변 길이 유니코드 문자열',
    needsLength: true,
    needsPrecisionScale: false,
    canBeIdentity: false,
    defaultLength: 255,
    maxLength: 4000,
  },
  NTEXT: {
    category: '문자형',
    description: '가변 길이 대용량 유니코드 문자열 - 사용 권장하지 않음',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: false,
  },

  // 날짜/시간
  DATETIME: {
    category: '날짜/시간',
    description: '날짜와 시간 (1753-01-01 ~ 9999-12-31)',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: false,
  },
  DATETIME2: {
    category: '날짜/시간',
    description: '확장된 날짜와 시간 (0001-01-01 ~ 9999-12-31)',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: false,
  },
  SMALLDATETIME: {
    category: '날짜/시간',
    description: '날짜와 시간 (1900-01-01 ~ 2079-06-06)',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: false,
  },
  DATE: {
    category: '날짜/시간',
    description: '날짜만 저장 (0001-01-01 ~ 9999-12-31)',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: false,
  },
  TIME: {
    category: '날짜/시간',
    description: '시간만 저장 (00:00:00.0000000 ~ 23:59:59.9999999)',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: false,
  },
  DATETIMEOFFSET: {
    category: '날짜/시간',
    description: '시간대 정보가 포함된 날짜와 시간',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: false,
  },
  TIMESTAMP: {
    category: '날짜/시간',
    description: '자동으로 생성되는 고유한 이진 숫자',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: false,
  },

  // 이진 데이터
  BINARY: {
    category: '이진 데이터',
    description: '고정 길이 이진 데이터',
    needsLength: true,
    needsPrecisionScale: false,
    canBeIdentity: false,
    defaultLength: 1,
    maxLength: 8000,
  },
  VARBINARY: {
    category: '이진 데이터',
    description: '가변 길이 이진 데이터',
    needsLength: true,
    needsPrecisionScale: false,
    canBeIdentity: false,
    defaultLength: 255,
    maxLength: 8000,
  },
  IMAGE: {
    category: '이진 데이터',
    description: '가변 길이 대용량 이진 데이터 - 사용 권장하지 않음',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: false,
  },

  // 기타
  UNIQUEIDENTIFIER: {
    category: '기타',
    description: '16바이트 GUID',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: false,
  },
  XML: {
    category: '기타',
    description: 'XML 데이터',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: false,
  },
  JSON: {
    category: '기타',
    description: 'JSON 데이터 (SQL Server 2016+)',
    needsLength: false,
    needsPrecisionScale: false,
    canBeIdentity: false,
  },
};

const DataTypeSelector: React.FC<DataTypeSelectorProps> = ({
  control,
  watch,
  setValue,
  errors,
}) => {
  const watchedDataType = watch('dataType');
  const watchedIsIdentity = watch('identity');
  
  const currentTypeInfo = DATA_TYPE_INFO[watchedDataType as MSSQLDataType];

  // 데이터 타입 변경 시 관련 필드 초기화
  const handleDataTypeChange = (newDataType: MSSQLDataType) => {
    const typeInfo = DATA_TYPE_INFO[newDataType];
    
    // 길이 관련 필드 초기화
    if (typeInfo.needsLength) {
      setValue('maxLength', typeInfo.defaultLength || undefined);
    } else {
      setValue('maxLength', undefined);
    }
    
    // 정밀도/스케일 관련 필드 초기화
    if (typeInfo.needsPrecisionScale) {
      setValue('precision', typeInfo.defaultPrecision || undefined);
      setValue('scale', typeInfo.defaultScale || undefined);
    } else {
      setValue('precision', undefined);
      setValue('scale', undefined);
    }
    
    // Identity 설정 초기화 (지원하지 않는 타입인 경우)
    if (!typeInfo.canBeIdentity && watchedIsIdentity) {
      setValue('identity', false);
      // identitySeed/identityIncrement는 ColumnFormData에 없어서 제거
    }
  };

  const groupedDataTypes = Object.entries(DATA_TYPE_INFO).reduce((acc, [type, info]) => {
    if (!acc[info.category]) {
      acc[info.category] = [];
    }
    acc[info.category].push({ type: type as MSSQLDataType, info });
    return acc;
  }, {} as Record<string, Array<{ type: MSSQLDataType; info: DataTypeInfo }>>);

  return (
    <div className="space-y-4">
      {/* 데이터 타입 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          데이터 타입 *
        </label>
        <Controller
          name="dataType"
          control={control}
          rules={{ required: '데이터 타입을 선택하세요.' }}
          render={({ field }) => (
            <select
              {...field}
              onChange={(e) => {
                const newType = e.target.value as MSSQLDataType;
                field.onChange(newType);
                handleDataTypeChange(newType);
              }}
              className={`block w-full border rounded-md px-3 py-2 text-sm ${
                errors.dataType ? 'border-red-300' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
            >
              {Object.entries(groupedDataTypes).map(([category, types]) => (
                <optgroup key={category} label={category}>
                  {types.map(({ type }) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}
        />
        {errors.dataType && (
          <p className="mt-1 text-sm text-red-600">{errors.dataType.message}</p>
        )}
      </div>

      {/* 데이터 타입 설명 */}
      {currentTypeInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>{watchedDataType}</strong>: {currentTypeInfo.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 길이 설정 */}
      {currentTypeInfo?.needsLength && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            최대 길이 *
          </label>
          <Controller
            name="maxLength"
            control={control}
            rules={{
              required: '최대 길이를 입력하세요.',
              min: { value: 1, message: '최대 길이는 1 이상이어야 합니다.' },
              max: { 
                value: currentTypeInfo.maxLength || 8000, 
                message: `최대 길이는 ${currentTypeInfo.maxLength || 8000}을 초과할 수 없습니다.` 
              }
            }}
            render={({ field: { value, onChange, ...field } }) => (
              <div className="relative">
                <input
                  {...field}
                  type="number"
                  value={value || ''}
                  onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
                  className={`block w-full border rounded-md px-3 py-2 text-sm pr-16 ${
                    errors.maxLength ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder={`기본값: ${currentTypeInfo.defaultLength || ''}`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">
                    / {currentTypeInfo.maxLength}
                  </span>
                </div>
              </div>
            )}
          />
          {errors.maxLength && (
            <p className="mt-1 text-sm text-red-600">{errors.maxLength.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {watchedDataType.includes('NVARCHAR') || watchedDataType.includes('NCHAR') 
              ? '유니코드 문자 기준 (한글 1글자 = 1자)'
              : 'ANSI 문자 기준 (한글 1글자 = 2바이트)'
            }
          </p>
        </div>
      )}

      {/* 정밀도/스케일 설정 */}
      {currentTypeInfo?.needsPrecisionScale && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              정밀도 (Precision) *
            </label>
            <Controller
              name="precision"
              control={control}
              rules={{
                required: '정밀도를 입력하세요.',
                min: { value: 1, message: '정밀도는 1 이상이어야 합니다.' },
                max: { 
                  value: currentTypeInfo.maxPrecision || 38, 
                  message: `정밀도는 ${currentTypeInfo.maxPrecision || 38}을 초과할 수 없습니다.` 
                }
              }}
              render={({ field: { value, onChange, ...field } }) => (
                <input
                  {...field}
                  type="number"
                  value={value || ''}
                  onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
                  className={`block w-full border rounded-md px-3 py-2 text-sm ${
                    errors.precision ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder={`기본값: ${currentTypeInfo.defaultPrecision || ''}`}
                />
              )}
            />
            {errors.precision && (
              <p className="mt-1 text-sm text-red-600">{errors.precision.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">전체 자릿수</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              스케일 (Scale) *
            </label>
            <Controller
              name="scale"
              control={control}
              rules={{
                required: '스케일을 입력하세요.',
                min: { value: 0, message: '스케일은 0 이상이어야 합니다.' },
                max: { 
                  value: currentTypeInfo.maxScale || 38, 
                  message: `스케일은 ${currentTypeInfo.maxScale || 38}을 초과할 수 없습니다.` 
                },
                validate: (value) => {
                  const precision = watch('precision');
                  if (precision && value && value > precision) {
                    return '스케일은 정밀도보다 클 수 없습니다.';
                  }
                  return true;
                }
              }}
              render={({ field: { value, onChange, ...field } }) => (
                <input
                  {...field}
                  type="number"
                  value={value || ''}
                  onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
                  className={`block w-full border rounded-md px-3 py-2 text-sm ${
                    errors.scale ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder={`기본값: ${currentTypeInfo.defaultScale || ''}`}
                />
              )}
            />
            {errors.scale && (
              <p className="mt-1 text-sm text-red-600">{errors.scale.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">소수점 이하 자릿수</p>
          </div>
        </div>
      )}

      {/* Identity 설정 */}
      {currentTypeInfo?.canBeIdentity && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center mb-3">
            <Controller
              name="identity"
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
            <label className="ml-2 block text-sm font-medium text-gray-900">
              자동증가 (Identity) 설정
            </label>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            이 데이터 타입은 자동증가 설정을 지원합니다. 활성화하면 새 행이 삽입될 때마다 자동으로 값이 증가합니다.
          </p>

          {watchedIsIdentity && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작값 (Seed)
                </label>
                <Controller
                  name="maxLength"
                  control={control}
                  rules={{
                    required: watchedIsIdentity ? '시작값을 입력하세요.' : false,
                  }}
                  render={({ field: { value, onChange, ...field } }) => (
                    <input
                      {...field}
                      type="number"
                      value={value || ''}
                      onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="1"
                    />
                  )}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  증가값 (Increment)
                </label>
                <Controller
                  name="precision"
                  control={control}
                  rules={{
                    required: watchedIsIdentity ? '증가값을 입력하세요.' : false,
                    min: { value: 1, message: '증가값은 1 이상이어야 합니다.' }
                  }}
                  render={({ field: { value, onChange, ...field } }) => (
                    <input
                      {...field}
                      type="number"
                      value={value || ''}
                      onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="1"
                    />
                  )}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Identity를 지원하지 않는 타입에 대한 안내 */}
      {!currentTypeInfo?.canBeIdentity && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <p className="text-sm text-gray-600">
            <strong>{watchedDataType}</strong> 타입은 자동증가(Identity) 설정을 지원하지 않습니다.
            자동증가는 정수형 데이터 타입(BIGINT, INT, SMALLINT, TINYINT)에서만 사용할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default DataTypeSelector;