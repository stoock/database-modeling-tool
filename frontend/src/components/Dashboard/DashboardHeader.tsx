import React from 'react';
import { ProjectSelector } from '../ProjectManager';
import { ChangeIndicator, AutoSaveSettings, SaveFeedback } from '../ChangeTracker';
import type { Project } from '../../types';

interface DashboardHeaderProps {
  currentProject: Project | null;
  saveFeedbackStatus: 'idle' | 'saving' | 'success' | 'error';
  onProjectSelect: (project: Project) => void;
  onProjectSettings: (project: Project) => void;
  onShowCreateModal: (show: boolean) => void;
  onSaveAll: () => Promise<void>;
  onDismissFeedback: () => void;
  autoSaveInterval: number;
}

/**
 * 대시보드 헤더 컴포넌트
 * - 제목, 프로젝트 선택기, 새 프로젝트 생성 버튼
 * - 변경사항 추적 및 자동 저장 설정
 * - 연결 상태 표시
 */
const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentProject,
  saveFeedbackStatus,
  onProjectSelect,
  onProjectSettings,
  onShowCreateModal,
  onSaveAll,
  onDismissFeedback,
  autoSaveInterval
}) => {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-semibold text-gray-900">
              MSSQL 데이터베이스 모델링 도구
            </h1>
            
            {/* 프로젝트 선택기 */}
            <div className="w-80">
              <ProjectSelector
                onProjectSelect={onProjectSelect}
                onProjectSettings={onProjectSettings}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 새 프로젝트 생성 버튼 */}
            <button
              onClick={() => onShowCreateModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              새 프로젝트
            </button>

            {currentProject && (
              <div className="flex items-center space-x-4">
                <ChangeIndicator 
                  onSave={onSaveAll}
                  autoSaveInterval={autoSaveInterval}
                />
                <AutoSaveSettings />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">연결됨</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 저장 상태 피드백 */}
      <SaveFeedback 
        status={saveFeedbackStatus} 
        onDismiss={onDismissFeedback}
      />
    </>
  );
};

export default DashboardHeader;