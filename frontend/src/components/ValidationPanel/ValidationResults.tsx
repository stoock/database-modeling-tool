import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ArrowPathIcon,
  LightBulbIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useValidationStore } from '../../stores/validationStore';
import { useProjectStore } from '../../stores/projectStore';
import { useTableStore } from '../../stores/tableStore';
import type { ValidationError, ValidationWarning } from '../../types';

interface ValidationResultsProps {
  projectId: string;
  autoRefresh?: boolean;
}

const ValidationResults: React.FC<ValidationResultsProps> = ({
  projectId,
  autoRefresh = false
}) => {
  const { validateProject, validationResult, isValidating, tableValidations, columnValidations, indexValidations } = useValidationStore();
  const { currentProject } = useProjectStore();
  const { tables } = useTableStore();
  
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<Record<string, boolean>>({});
  
  // 자동 새로고침 설정
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        handleRefresh();
      }, 30000); // 30초마다 자동 새로고침
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, projectId]);
  
  // 검증 결과 새로고침
  const handleRefresh = async () => {
    await validateProject(projectId);
    setLastRefreshed(new Date());
  };
  
  // 제안 표시 토글
  const toggleSuggestion = (id: string) => {
    setShowSuggestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // 모든 검증 오류 수집
  const getAllErrors = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // 프로젝트 전체 검증 결과
    if (validationResult?.errors) {
      errors.push(...validationResult.errors);
    }
    
    // 테이블별 검증 결과
    Object.values(tableValidations).forEach(tableErrors => {
      errors.push(...tableErrors);
    });
    
    // 컬럼별 검증 결과
    Object.values(columnValidations).forEach(columnErrors => {
      errors.push(...columnErrors);
    });
    
    // 인덱스별 검증 결과
    Object.values(indexValidations).forEach(indexErrors => {
      errors.push(...indexErrors);
    });
    
    return errors;
  };
  
  // 모든 검증 경고 수집
  const getAllWarnings = (): ValidationWarning[] => {
    return validationResult?.warnings || [];
  };
  
  const errors = getAllErrors();
  const warnings = getAllWarnings();
  
  // 테이블 이름 조회
  const getTableName = (tableId: string): string => {
    const table = tables.find(t => t.id === tableId);
    return table ? table.name : '알 수 없는 테이블';
  };
  
  // 컬럼 이름 조회
  const getColumnName = (columnId: string): string => {
    for (const table of tables) {
      const column = table.columns.find(c => c.id === columnId);
      if (column) {
        return `${table.name}.${column.name}`;
      }
    }
    return '알 수 없는 컬럼';
  };
  
  // 인덱스 이름 조회
  const getIndexName = (indexId: string): string => {
    for (const table of tables) {
      const index = table.indexes.find(i => i.id === indexId);
      if (index) {
        return `${table.name}.${index.name}`;
      }
    }
    return '알 수 없는 인덱스';
  };
  
  // 필드 이름 조회
  const getEntityName = (field: string): string => {
    if (field.startsWith('table:')) {
      return getTableName(field.substring(6));
    } else if (field.startsWith('column:')) {
      return getColumnName(field.substring(7));
    } else if (field.startsWith('index:')) {
      return getIndexName(field.substring(6));
    }
    return field;
  };
  
  // 제안 적용 처리
  const applySuggestion = async (error: ValidationError) => {
    // 실제 구현에서는 여기에 제안을 적용하는 로직 추가
    console.log('제안 적용:', error.suggestion);
    
    // 예시: 테이블 이름 수정
    if (error.field.startsWith('table:')) {
      const tableId = error.field.substring(6);
      // 테이블 이름 업데이트 로직
    }
    // 다른 엔티티 타입에 대한 처리 추가
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">검증 결과</h2>
        
        <div className="flex items-center space-x-2">
          {lastRefreshed && (
            <span className="text-xs text-gray-500">
              마지막 업데이트: {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
          
          <button
            onClick={handleRefresh}
            disabled={isValidating}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isValidating ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                검증 중...
              </>
            ) : (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                새로고침
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* 검증 요약 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">총 검증 항목</h3>
            <span className="text-lg font-semibold text-gray-900">
              {tables.length + tables.reduce((sum, t) => sum + t.columns.length + t.indexes.length, 0)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            테이블, 컬럼, 인덱스 포함
          </p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-red-700">오류</h3>
            <span className="text-lg font-semibold text-red-700">
              {errors.length}
            </span>
          </div>
          <p className="text-xs text-red-600 mt-1">
            수정이 필요한 항목
          </p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-yellow-700">경고</h3>
            <span className="text-lg font-semibold text-yellow-700">
              {warnings.length}
            </span>
          </div>
          <p className="text-xs text-yellow-600 mt-1">
            검토가 권장되는 항목
          </p>
        </div>
      </div>
      
      {/* 오류 목록 */}
      {errors.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-1" />
            오류 목록
          </h3>
          
          <div className="space-y-3">
            {errors.map((error, index) => (
              <div key={`error-${index}`} className="bg-red-50 rounded-md p-3">
                <div className="flex justify-between">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        {getEntityName(error.field)}
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        {error.message}
                      </p>
                      
                      {error.suggestion && (
                        <div className="mt-2">
                          <button
                            onClick={() => toggleSuggestion(`error-${index}`)}
                            className="inline-flex items-center text-xs text-red-700 hover:text-red-900"
                          >
                            <LightBulbIcon className="h-4 w-4 mr-1" />
                            {showSuggestions[`error-${index}`] ? '제안 숨기기' : '제안 보기'}
                          </button>
                          
                          {showSuggestions[`error-${index}`] && (
                            <div className="mt-2 bg-white bg-opacity-50 p-2 rounded">
                              <div className="flex items-center">
                                <ArrowRightIcon className="h-3 w-3 text-red-600 mr-1" />
                                <span className="text-xs font-medium text-red-800">
                                  {error.suggestion}
                                </span>
                              </div>
                              <button
                                onClick={() => applySuggestion(error)}
                                className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                              >
                                이 제안 적용하기
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-red-700 font-medium">
                    {error.rule}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 경고 목록 */}
      {warnings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-1" />
            경고 목록
          </h3>
          
          <div className="space-y-3">
            {warnings.map((warning, index) => (
              <div key={`warning-${index}`} className="bg-yellow-50 rounded-md p-3">
                <div className="flex justify-between">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        {getEntityName(warning.field)}
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        {warning.message}
                      </p>
                      
                      {warning.suggestion && (
                        <div className="mt-2">
                          <button
                            onClick={() => toggleSuggestion(`warning-${index}`)}
                            className="inline-flex items-center text-xs text-yellow-700 hover:text-yellow-900"
                          >
                            <LightBulbIcon className="h-4 w-4 mr-1" />
                            {showSuggestions[`warning-${index}`] ? '제안 숨기기' : '제안 보기'}
                          </button>
                          
                          {showSuggestions[`warning-${index}`] && (
                            <div className="mt-2 bg-white bg-opacity-50 p-2 rounded">
                              <div className="flex items-center">
                                <ArrowRightIcon className="h-3 w-3 text-yellow-600 mr-1" />
                                <span className="text-xs font-medium text-yellow-800">
                                  {warning.suggestion}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 모든 검증 통과 */}
      {errors.length === 0 && warnings.length === 0 && (
        <div className="bg-green-50 rounded-md p-4 flex items-start">
          <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5 mr-2" />
          <div>
            <p className="text-sm font-medium text-green-800">
              모든 검증을 통과했습니다!
            </p>
            <p className="text-sm text-green-700 mt-1">
              현재 스키마는 설정된 네이밍 규칙을 모두 준수하고 있습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationResults;