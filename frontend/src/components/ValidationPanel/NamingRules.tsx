import React, { useState, useEffect } from 'react';
import { 
  CheckIcon, 
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useProjectStore } from '../../stores/projectStore';
import type { NamingRules, CaseType } from '../../types';

interface NamingRulesProps {
  projectId: string;
}

const NamingRulesPanel: React.FC<NamingRulesProps> = ({
  projectId: _projectId
}) => {
  const { currentProject, updateNamingRules } = useProjectStore();
  
  const [tablePrefix, setTablePrefix] = useState('');
  const [tableSuffix, setTableSuffix] = useState('');
  const [tablePattern, setTablePattern] = useState('');
  const [columnPattern, setColumnPattern] = useState('');
  const [indexPattern, setIndexPattern] = useState('');
  const [enforceCase, setEnforceCase] = useState<CaseType | ''>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 현재 프로젝트의 네이밍 규칙으로 폼 초기화
  useEffect(() => {
    if (currentProject?.namingRules) {
      const rules = currentProject.namingRules;
      setTablePrefix(rules.tablePrefix || '');
      setTableSuffix(rules.tableSuffix || '');
      setTablePattern(rules.tablePattern || '');
      setColumnPattern(rules.columnPattern || '');
      setIndexPattern(rules.indexPattern || '');
      setEnforceCase(rules.enforceCase || '');
    }
  }, [currentProject]);
  
  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // 패턴 유효성 검사
      if (tablePattern) {
        try {
          new RegExp(tablePattern);
        } catch (err) {
          throw new Error('테이블 패턴이 유효한 정규식이 아닙니다.');
        }
      }
      
      if (columnPattern) {
        try {
          new RegExp(columnPattern);
        } catch (err) {
          throw new Error('컬럼 패턴이 유효한 정규식이 아닙니다.');
        }
      }
      
      if (indexPattern) {
        try {
          new RegExp(indexPattern);
        } catch (err) {
          throw new Error('인덱스 패턴이 유효한 정규식이 아닙니다.');
        }
      }
      
      const namingRules: NamingRules = {
        tablePrefix: tablePrefix || undefined,
        tableSuffix: tableSuffix || undefined,
        tablePattern: tablePattern || undefined,
        columnPattern: columnPattern || undefined,
        indexPattern: indexPattern || undefined,
        enforceCase: enforceCase as CaseType || undefined
      };
      
      await updateNamingRules(namingRules);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '네이밍 규칙 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 케이스 타입 설명
  const getCaseDescription = (caseType: string): string => {
    switch (caseType) {
      case 'UPPER':
        return '모두 대문자 (예: TABLE_NAME)';
      case 'LOWER':
        return '모두 소문자 (예: table_name)';
      case 'PASCAL':
        return '파스칼 케이스 (예: TableName)';
      case 'SNAKE':
        return '스네이크 케이스 (예: table_name)';
      default:
        return '';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">네이밍 규칙 설정</h2>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      
      {saveSuccess && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 flex items-center">
          <CheckIcon className="h-5 w-5 mr-2" />
          네이밍 규칙이 성공적으로 저장되었습니다.
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 테이블 네이밍 규칙 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 border-b pb-2">테이블 네이밍 규칙</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tablePrefix" className="block text-sm font-medium text-gray-700">
                테이블 접두사
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="tablePrefix"
                  value={tablePrefix}
                  onChange={(e) => setTablePrefix(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="tbl_"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                모든 테이블 이름 앞에 추가될 접두사
              </p>
            </div>
            
            <div>
              <label htmlFor="tableSuffix" className="block text-sm font-medium text-gray-700">
                테이블 접미사
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="tableSuffix"
                  value={tableSuffix}
                  onChange={(e) => setTableSuffix(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="_table"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                모든 테이블 이름 뒤에 추가될 접미사
              </p>
            </div>
          </div>
          
          <div>
            <label htmlFor="tablePattern" className="block text-sm font-medium text-gray-700">
              테이블 이름 패턴 (정규식)
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="tablePattern"
                value={tablePattern}
                onChange={(e) => setTablePattern(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="^[A-Z][a-zA-Z0-9]*$"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              테이블 이름이 따라야 하는 정규식 패턴
            </p>
          </div>
        </div>
        
        {/* 컬럼 네이밍 규칙 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 border-b pb-2">컬럼 네이밍 규칙</h3>
          
          <div>
            <label htmlFor="columnPattern" className="block text-sm font-medium text-gray-700">
              컬럼 이름 패턴 (정규식)
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="columnPattern"
                value={columnPattern}
                onChange={(e) => setColumnPattern(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="^[a-z][a-z0-9_]*$"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              컬럼 이름이 따라야 하는 정규식 패턴
            </p>
          </div>
        </div>
        
        {/* 인덱스 네이밍 규칙 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 border-b pb-2">인덱스 네이밍 규칙</h3>
          
          <div>
            <label htmlFor="indexPattern" className="block text-sm font-medium text-gray-700">
              인덱스 이름 패턴 (정규식)
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="indexPattern"
                value={indexPattern}
                onChange={(e) => setIndexPattern(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="^IX_[A-Za-z0-9_]+$"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              인덱스 이름이 따라야 하는 정규식 패턴
            </p>
          </div>
        </div>
        
        {/* 케이스 규칙 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 border-b pb-2">케이스 규칙</h3>
          
          <div>
            <label htmlFor="enforceCase" className="block text-sm font-medium text-gray-700">
              케이스 강제 적용
            </label>
            <div className="mt-1">
              <select
                id="enforceCase"
                value={enforceCase}
                onChange={(e) => setEnforceCase(e.target.value as CaseType | '')}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                <option value="">케이스 강제 적용 안함</option>
                <option value="UPPER">대문자 (UPPER_CASE)</option>
                <option value="LOWER">소문자 (lower_case)</option>
                <option value="PASCAL">파스칼 케이스 (PascalCase)</option>
                <option value="SNAKE">스네이크 케이스 (snake_case)</option>
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              모든 식별자에 적용할 케이스 스타일
            </p>
          </div>
          
          {enforceCase && (
            <div className="rounded-md bg-blue-50 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    {getCaseDescription(enforceCase)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? '저장 중...' : '네이밍 규칙 저장'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NamingRulesPanel;