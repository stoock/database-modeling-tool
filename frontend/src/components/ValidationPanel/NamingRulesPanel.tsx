import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useProjectStore } from '../../stores/projectStore';
import { useValidationStore } from '../../stores/validationStore';
import type { NamingRules, CaseType } from '../../types';

interface NamingRulesPanelProps {
  projectId: string;
}

interface NamingRulesFormData {
  tableNamePattern: string;
  tableNameCase: CaseType;
  tableNamePrefix: string;
  tableNameSuffix: string;
  columnNamePattern: string;
  columnNameCase: CaseType;
  columnNamePrefix: string;
  columnNameSuffix: string;
  indexNamePattern: string;
  indexNameCase: CaseType;
  indexNamePrefix: string;
  indexNameSuffix: string;
  primaryKeyPattern: string;
  foreignKeyPattern: string;
  uniqueConstraintPattern: string;
  checkConstraintPattern: string;
  reservedWords: string;
}

const CASE_OPTIONS: { value: CaseType; label: string }[] = [
  { value: 'PASCAL_CASE', label: 'PascalCase' },
  { value: 'CAMEL_CASE', label: 'camelCase' },
  { value: 'SNAKE_CASE', label: 'snake_case' },
  { value: 'KEBAB_CASE', label: 'kebab-case' },
  { value: 'UPPER_CASE', label: 'UPPER_CASE' },
  { value: 'LOWER_CASE', label: 'lower_case' },
];

const NamingRulesPanel: React.FC<NamingRulesPanelProps> = ({ projectId }) => {
  const { currentProject, updateProject } = useProjectStore();
  const { validateProject } = useValidationStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<NamingRulesFormData>();

  // 현재 프로젝트의 네이밍 규칙으로 폼 초기화
  useEffect(() => {
    if (currentProject?.namingRules) {
      const rules = currentProject.namingRules;
      reset({
        tableNamePattern: rules.tableNamePattern || '',
        tableNameCase: rules.tableNameCase || 'PASCAL_CASE',
        tableNamePrefix: rules.tableNamePrefix || '',
        tableNameSuffix: rules.tableNameSuffix || '',
        columnNamePattern: rules.columnNamePattern || '',
        columnNameCase: rules.columnNameCase || 'SNAKE_CASE',
        columnNamePrefix: rules.columnNamePrefix || '',
        columnNameSuffix: rules.columnNameSuffix || '',
        indexNamePattern: rules.indexNamePattern || '',
        indexNameCase: rules.indexNameCase || 'UPPER_CASE',
        indexNamePrefix: rules.indexNamePrefix || 'IX_',
        indexNameSuffix: rules.indexNameSuffix || '',
        primaryKeyPattern: rules.primaryKeyPattern || 'PK_{tableName}',
        foreignKeyPattern: rules.foreignKeyPattern || 'FK_{tableName}_{referencedTable}',
        uniqueConstraintPattern: rules.uniqueConstraintPattern || 'UQ_{tableName}_{columnName}',
        checkConstraintPattern: rules.checkConstraintPattern || 'CK_{tableName}_{columnName}',
        reservedWords: rules.reservedWords?.join(', ') || '',
      });
    }
  }, [currentProject?.namingRules, reset]);

  const onSubmit = async (data: NamingRulesFormData) => {
    if (!currentProject) return;

    setIsLoading(true);
    setSaveStatus('saving');

    try {
      const namingRules: NamingRules = {
        tableNamePattern: data.tableNamePattern.trim() || undefined,
        tableNameCase: data.tableNameCase,
        tableNamePrefix: data.tableNamePrefix.trim() || undefined,
        tableNameSuffix: data.tableNameSuffix.trim() || undefined,
        columnNamePattern: data.columnNamePattern.trim() || undefined,
        columnNameCase: data.columnNameCase,
        columnNamePrefix: data.columnNamePrefix.trim() || undefined,
        columnNameSuffix: data.columnNameSuffix.trim() || undefined,
        indexNamePattern: data.indexNamePattern.trim() || undefined,
        indexNameCase: data.indexNameCase,
        indexNamePrefix: data.indexNamePrefix.trim() || undefined,
        indexNameSuffix: data.indexNameSuffix.trim() || undefined,
        primaryKeyPattern: data.primaryKeyPattern.trim() || undefined,
        foreignKeyPattern: data.foreignKeyPattern.trim() || undefined,
        uniqueConstraintPattern: data.uniqueConstraintPattern.trim() || undefined,
        checkConstraintPattern: data.checkConstraintPattern.trim() || undefined,
        reservedWords: data.reservedWords
          .split(',')
          .map(word => word.trim())
          .filter(word => word.length > 0),
      };

      const success = await updateProject(currentProject.id, {
        ...currentProject,
        namingRules,
      });

      if (success) {
        setSaveStatus('success');
        // 저장 후 프로젝트 재검증
        setTimeout(() => {
          validateProject(projectId);
        }, 500);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const resetToDefaults = () => {
    reset({
      tableNamePattern: '',
      tableNameCase: 'PASCAL_CASE',
      tableNamePrefix: '',
      tableNameSuffix: '',
      columnNamePattern: '',
      columnNameCase: 'SNAKE_CASE',
      columnNamePrefix: '',
      columnNameSuffix: '',
      indexNamePattern: '',
      indexNameCase: 'UPPER_CASE',
      indexNamePrefix: 'IX_',
      indexNameSuffix: '',
      primaryKeyPattern: 'PK_{tableName}',
      foreignKeyPattern: 'FK_{tableName}_{referencedTable}',
      uniqueConstraintPattern: 'UQ_{tableName}_{columnName}',
      checkConstraintPattern: 'CK_{tableName}_{columnName}',
      reservedWords: 'SELECT, INSERT, UPDATE, DELETE, FROM, WHERE, JOIN, INNER, LEFT, RIGHT, FULL, OUTER',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">네이밍 규칙 설정</h3>
          <p className="text-sm text-gray-600 mt-1">
            데이터베이스 객체의 네이밍 규칙을 설정하여 일관성을 유지하세요.
          </p>
        </div>
        
        {saveStatus !== 'idle' && (
          <div className="flex items-center space-x-2">
            {saveStatus === 'saving' && (
              <div className="text-blue-600 text-sm">저장 중...</div>
            )}
            {saveStatus === 'success' && (
              <>
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span className="text-green-600 text-sm">저장 완료</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                <span className="text-red-600 text-sm">저장 실패</span>
              </>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* 테이블 네이밍 규칙 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">테이블 네이밍 규칙</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                네이밍 패턴 (정규식)
              </label>
              <input
                type="text"
                {...register('tableNamePattern')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="예: ^[A-Z][a-zA-Z0-9]*$"
              />
              <p className="mt-1 text-xs text-gray-500">
                정규식으로 테이블명 패턴을 지정 (선택사항)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                케이스 규칙
              </label>
              <select
                {...register('tableNameCase')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {CASE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                접두사
              </label>
              <input
                type="text"
                {...register('tableNamePrefix')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="예: tbl_"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                접미사
              </label>
              <input
                type="text"
                {...register('tableNameSuffix')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="예: _table"
              />
            </div>
          </div>
        </div>

        {/* 컬럼 네이밍 규칙 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">컬럼 네이밍 규칙</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                네이밍 패턴 (정규식)
              </label>
              <input
                type="text"
                {...register('columnNamePattern')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="예: ^[a-z][a-z0-9_]*$"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                케이스 규칙
              </label>
              <select
                {...register('columnNameCase')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {CASE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                접두사
              </label>
              <input
                type="text"
                {...register('columnNamePrefix')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="예: col_"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                접미사
              </label>
              <input
                type="text"
                {...register('columnNameSuffix')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="예: _id"
              />
            </div>
          </div>
        </div>

        {/* 인덱스 네이밍 규칙 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">인덱스 네이밍 규칙</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                네이밍 패턴 (정규식)
              </label>
              <input
                type="text"
                {...register('indexNamePattern')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="예: ^IX_[A-Z][a-zA-Z0-9_]*$"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                케이스 규칙
              </label>
              <select
                {...register('indexNameCase')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {CASE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                접두사
              </label>
              <input
                type="text"
                {...register('indexNamePrefix')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="IX_"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                접미사
              </label>
              <input
                type="text"
                {...register('indexNameSuffix')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="예: _idx"
              />
            </div>
          </div>
        </div>

        {/* 제약조건 네이밍 규칙 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">제약조건 네이밍 규칙</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                기본키 패턴
              </label>
              <input
                type="text"
                {...register('primaryKeyPattern')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="PK_{tableName}"
              />
              <p className="mt-1 text-xs text-gray-500">
                {'{tableName}'}을 사용하여 테이블명 참조
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                외래키 패턴
              </label>
              <input
                type="text"
                {...register('foreignKeyPattern')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="FK_{tableName}_{referencedTable}"
              />
              <p className="mt-1 text-xs text-gray-500">
                {'{tableName}'}, {'{referencedTable}'}을 사용
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                유니크 제약조건 패턴
              </label>
              <input
                type="text"
                {...register('uniqueConstraintPattern')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="UQ_{tableName}_{columnName}"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                체크 제약조건 패턴
              </label>
              <input
                type="text"
                {...register('checkConstraintPattern')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="CK_{tableName}_{columnName}"
              />
            </div>
          </div>
        </div>

        {/* 예약어 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">예약어</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              사용 금지 단어 (쉼표로 구분)
            </label>
            <textarea
              rows={3}
              {...register('reservedWords')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="SELECT, INSERT, UPDATE, DELETE, FROM, WHERE, JOIN"
            />
            <p className="mt-1 text-xs text-gray-500">
              테이블명이나 컬럼명으로 사용할 수 없는 단어들을 쉼표로 구분하여 입력
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={resetToDefaults}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            기본값으로 재설정
          </button>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isLoading || !isDirty}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '저장 중...' : '규칙 저장'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NamingRulesPanel;