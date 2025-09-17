import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useValidationStore } from '../../stores/validationStore';
// import { useTableStore } from '../../stores/tableStore';
import ValidationResults from './ValidationResults';
import NamingRulesPanel from './NamingRulesPanel';
import ValidationGuide from './ValidationGuide';

interface ValidationDashboardProps {
  projectId: string;
}

const ValidationDashboard: React.FC<ValidationDashboardProps> = ({
  projectId
}) => {
  const { validateProject, isValidating } = useValidationStore();
  // const { tables } = useTableStore();
  
  const [activeTab, setActiveTab] = useState<'results' | 'rules' | 'guide'>('results');
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // 초기 검증 실행
  useEffect(() => {
    validateProject(projectId);
  }, [projectId, validateProject]);
  
  // 탭 전환 처리
  const handleTabChange = (tab: 'results' | 'rules' | 'guide') => {
    setActiveTab(tab);
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-3">
            <h2 className="text-lg font-medium text-gray-900">스키마 검증</h2>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  id="autoRefresh"
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="autoRefresh" className="ml-2 text-sm text-gray-700">
                  자동 새로고침
                </label>
              </div>
              
              <button
                onClick={() => validateProject(projectId)}
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
                    지금 검증
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex border-t border-gray-200">
            <button
              onClick={() => handleTabChange('results')}
              className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'results'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              검증 결과
            </button>
            <button
              onClick={() => handleTabChange('rules')}
              className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'rules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              네이밍 규칙 설정
            </button>
            <button
              onClick={() => handleTabChange('guide')}
              className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'guide'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <QuestionMarkCircleIcon className="h-5 w-5 mr-2" />
              해결 가이드
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {activeTab === 'results' ? (
            <ValidationResults projectId={projectId} autoRefresh={autoRefresh} />
          ) : activeTab === 'rules' ? (
            <NamingRulesPanel projectId={projectId} />
          ) : (
            <ValidationGuide />
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationDashboard;