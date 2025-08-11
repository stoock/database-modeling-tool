import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useProjectStore } from '../../stores/projectStore';
// import { useValidationStore } from '../../stores/validationStore';
import type { NamingRules, CaseType } from '../../types';

interface NamingRulesPanelProps {
  projectId: string;
}

interface NamingRulesFormData {
  tablePrefix: string;
  tableSuffix: string;
  tablePattern: string;
  columnPattern: string;
  indexPattern: string;
  enforceCase: CaseType;
}

const CASE_OPTIONS: { value: CaseType; label: string }[] = [
  { value: 'PASCAL', label: 'PascalCase' },
  { value: 'SNAKE', label: 'snake_case' },
  { value: 'UPPER', label: 'UPPER_CASE' },
  { value: 'LOWER', label: 'lower_case' },
];

const NamingRulesPanel: React.FC<NamingRulesPanelProps> = () => {
  const { currentProject, updateProject } = useProjectStore();
  // const { validateProject } = useValidationStore();

  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<NamingRulesFormData>();

  // 현재 프로젝트의 네이밍 규칙으로 폼 초기화
  useEffect(() => {
    if (currentProject?.namingRules) {
      const rules = currentProject.namingRules;
      reset({
        tablePrefix: rules.tablePrefix || '',
        tableSuffix: rules.tableSuffix || '',
        tablePattern: rules.tablePattern || '',
        columnPattern: rules.columnPattern || '',
        indexPattern: rules.indexPattern || '',
        enforceCase: rules.enforceCase || 'PASCAL',
      });
    }
  }, [currentProject?.namingRules, reset]);

  const onSubmit = async (data: NamingRulesFormData) => {
    if (!currentProject) return;

    setIsLoading(true);
    setSaveStatus('saving');

    try {
      const namingRules: NamingRules = {
        tablePrefix: data.tablePrefix.trim() || undefined,
        tableSuffix: data.tableSuffix.trim() || undefined,
        tablePattern: data.tablePattern.trim() || undefined,
        columnPattern: data.columnPattern.trim() || undefined,
        indexPattern: data.indexPattern.trim() || undefined,
        enforceCase: data.enforceCase,
      };

      const success = await updateProject(currentProject.id, {
        ...currentProject,
        namingRules,
      });

      if (success) {
        setSaveStatus('success');
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Failed to update naming rules:', error);
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const resetToDefaults = () => {
    reset({
      tablePrefix: '',
      tableSuffix: '',
      tablePattern: '',
      columnPattern: '',
      indexPattern: '',
      enforceCase: 'PASCAL',
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
        <div className="flex items-center space-x-2">
          {saveStatus === 'success' && (
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="h-5 w-5 mr-1" />
              <span className="text-sm">저장됨</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center text-red-600">
              <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
              <span className="text-sm">저장 실패</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 테이블 규칙 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4">테이블 네이밍</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                접두사
              </label>
              <input
                type="text"
                {...register('tablePrefix')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: tbl_"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                접미사
              </label>
              <input
                type="text"
                {...register('tableSuffix')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: _table"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                패턴
              </label>
              <input
                type="text"
                {...register('tablePattern')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: ^[A-Z][a-zA-Z0-9]*$"
              />
            </div>
          </div>
        </div>

        {/* 컬럼 규칙 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4">컬럼 네이밍</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              패턴
            </label>
            <input
              type="text"
              {...register('columnPattern')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: ^[a-z][a-z0-9_]*$"
            />
          </div>
        </div>

        {/* 인덱스 규칙 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4">인덱스 네이밍</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              패턴
            </label>
            <input
              type="text"
              {...register('indexPattern')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: IX_{tableName}_{columnName}"
            />
          </div>
        </div>

        {/* 케이스 규칙 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4">케이스 규칙</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              강제 케이스
            </label>
            <select
              {...register('enforceCase')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {CASE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={resetToDefaults}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            기본값으로 재설정
          </button>
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NamingRulesPanel;