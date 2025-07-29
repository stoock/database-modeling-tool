import React from 'react';
import type { Project } from '../../types';

interface WelcomeScreenProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  onProjectEdit: (project: Project) => void;
  onProjectDelete: (projectId: string) => void;
  onShowCreateModal: () => void;
}

/**
 * 웰컴 화면 컴포넌트
 * - 프로젝트가 선택되지 않았을 때 표시
 * - 최근 프로젝트 목록 및 새 프로젝트 생성 유도
 */
const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  projects,
  onProjectSelect,
  onProjectEdit,
  onProjectDelete,
  onShowCreateModal
}) => {
  return (
    <div className="text-center py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          데이터베이스 모델링을 시작하세요
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          상단의 프로젝트 선택기에서 기존 프로젝트를 선택하거나 새 프로젝트를 생성하세요.
        </p>
        
        {projects.length > 0 ? (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">최근 프로젝트</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {projects.slice(0, 4).map((project) => (
                <div
                  key={project.id}
                  className="relative p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group"
                  onClick={() => onProjectSelect(project)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600">
                        {project.name}
                      </h4>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                        <span>테이블 {project.tables?.length || 0}개</span>
                        <span>•</span>
                        <span>컬럼 {project.tables?.reduce((sum, table) => sum + (table.columns?.length || 0), 0) || 0}개</span>
                        <span>•</span>
                        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onProjectEdit(project);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="프로젝트 편집"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onProjectDelete(project.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="프로젝트 삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 mb-8">
            <p className="text-gray-500 text-lg">
              아직 생성된 프로젝트가 없습니다.
            </p>
            <p className="text-gray-400 mt-2">
              첫 번째 프로젝트를 생성하여 데이터베이스 모델링을 시작하세요.
            </p>
          </div>
        )}
        
        <button
          onClick={onShowCreateModal}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 프로젝트 생성
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;