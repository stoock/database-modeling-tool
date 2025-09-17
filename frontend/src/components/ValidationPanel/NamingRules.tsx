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

const NamingRulesPanel: React.FC<NamingRulesProps> = () => {
  const { currentProject, updateNamingRules } = useProjectStore();
  
  const [tablePrefix, setTablePrefix] = useState('');
  const [tableSuffix, setTableSuffix] = useState('');
  const [tablePattern, setTablePattern] = useState('');
  const [columnPattern, setColumnPattern] = useState('');
  const [indexPattern, setIndexPattern] = useState('');
  const [enforceCase, setEnforceCase] = useState<CaseType | ''>('');
  
  // SQL Server 특화 규칙 상태
  const [enforceUpperCase, setEnforceUpperCase] = useState(false);
  const [recommendAuditColumns, setRecommendAuditColumns] = useState(false);
  const [requireDescription, setRequireDescription] = useState(false);
  const [enforceTableColumnNaming, setEnforceTableColumnNaming] = useState(false);
  const [enforceConstraintNaming, setEnforceConstraintNaming] = useState(false);
  const [abbreviationRules, setAbbreviationRules] = useState('');
  
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
      
      // SQL Server 특화 규칙 초기화
      setEnforceUpperCase(rules.enforceUpperCase || false);
      setRecommendAuditColumns(rules.recommendAuditColumns || false);
      setRequireDescription(rules.requireDescription || false);
      setEnforceTableColumnNaming(rules.enforceTableColumnNaming || false);
      setEnforceConstraintNaming(rules.enforceConstraintNaming || false);
      setAbbreviationRules(rules.abbreviationRules || '');
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
        } catch {
          throw new Error('테이블 패턴이 유효한 정규식이 아닙니다.');
        }
      }
      
      if (columnPattern) {
        try {
          new RegExp(columnPattern);
        } catch {
          throw new Error('컬럼 패턴이 유효한 정규식이 아닙니다.');
        }
      }
      
      if (indexPattern) {
        try {
          new RegExp(indexPattern);
        } catch {
          throw new Error('인덱스 패턴이 유효한 정규식이 아닙니다.');
        }
      }
      
      const namingRules: NamingRules = {
        tablePrefix: tablePrefix || undefined,
        tableSuffix: tableSuffix || undefined,
        tablePattern: tablePattern || undefined,
        columnPattern: columnPattern || undefined,
        indexPattern: indexPattern || undefined,
        enforceCase: enforceCase as CaseType || undefined,
        
        // SQL Server 특화 규칙
        enforceUpperCase,
        recommendAuditColumns,
        requireDescription,
        enforceTableColumnNaming,
        enforceConstraintNaming,
        abbreviationRules: abbreviationRules || undefined
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
        
        {/* SQL Server 특화 규칙 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 border-b pb-2">SQL Server 특화 규칙</h3>
          
          <div className="space-y-3">
            {/* 대문자 강제 */}
            <div className="flex items-center">
              <input
                id="enforceUpperCase"
                type="checkbox"
                checked={enforceUpperCase}
                onChange={(e) => setEnforceUpperCase(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enforceUpperCase" className="ml-3 text-sm font-medium text-gray-700">
                대문자 강제 적용
              </label>
            </div>
            <p className="ml-7 text-xs text-gray-500">
              모든 테이블명, 컬럼명을 대문자로 작성하도록 강제합니다
            </p>
            
            {/* 감사 컬럼 권장 */}
            <div className="flex items-center">
              <input
                id="recommendAuditColumns"
                type="checkbox"
                checked={recommendAuditColumns}
                onChange={(e) => setRecommendAuditColumns(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="recommendAuditColumns" className="ml-3 text-sm font-medium text-gray-700">
                감사 컬럼 권장
              </label>
            </div>
            <p className="ml-7 text-xs text-gray-500">
              REG_ID, REG_DT, CHG_ID, CHG_DT 컬럼 추가를 권장합니다 (경고)
            </p>
            
            {/* 설명 필수 */}
            <div className="flex items-center">
              <input
                id="requireDescription"
                type="checkbox"
                checked={requireDescription}
                onChange={(e) => setRequireDescription(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requireDescription" className="ml-3 text-sm font-medium text-gray-700">
                Description 필수
              </label>
            </div>
            <p className="ml-7 text-xs text-gray-500">
              모든 테이블과 컬럼에 한글 설명을 필수로 입력하도록 합니다
            </p>
            
            {/* 테이블+컬럼 명명 강제 */}
            <div className="flex items-center">
              <input
                id="enforceTableColumnNaming"
                type="checkbox"
                checked={enforceTableColumnNaming}
                onChange={(e) => setEnforceTableColumnNaming(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enforceTableColumnNaming" className="ml-3 text-sm font-medium text-gray-700">
                기본키 명명 규칙 강제
              </label>
            </div>
            <p className="ml-7 text-xs text-gray-500">
              단독명칭(ID, SEQ_NO) 사용 시 경고, 테이블명+컬럼명 조합을 권장합니다
            </p>
            
            {/* 제약조건 명명 강제 */}
            <div className="flex items-center">
              <input
                id="enforceConstraintNaming"
                type="checkbox"
                checked={enforceConstraintNaming}
                onChange={(e) => setEnforceConstraintNaming(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enforceConstraintNaming" className="ml-3 text-sm font-medium text-gray-700">
                제약조건 명명 규칙 강제
              </label>
            </div>
            <p className="ml-7 text-xs text-gray-500">
              PK__{`테이블명`}__{`컬럼명`} 형태의 제약조건 명명을 강제합니다
            </p>
            
            {/* 약어 규칙 */}
            <div>
              <label htmlFor="abbreviationRules" className="block text-sm font-medium text-gray-700">
                약어 규칙 (선택사항)
              </label>
              <div className="mt-1">
                <textarea
                  id="abbreviationRules"
                  value={abbreviationRules}
                  onChange={(e) => setAbbreviationRules(e.target.value)}
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="CUSTOMER=CUST, REQUEST=REQ, SEQUENCE=SEQ"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                프로젝트에서 사용할 약어 규칙을 정의합니다 (형식: 원어=약어, 쉼표로 구분)
              </p>
            </div>
          </div>
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