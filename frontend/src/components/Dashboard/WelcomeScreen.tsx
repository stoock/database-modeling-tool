import React from 'react';
import Button from '../common/Button';
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
    <div className="text-center py-16 min-h-[80vh] flex items-center">
      <div className="max-w-4xl mx-auto">
        {/* 헤로 섹션 */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="relative">
            <div className="mx-auto h-32 w-32 bg-gradient-to-br from-primary-600 to-accent-500 rounded-3xl flex items-center justify-center mb-8 shadow-strong animate-float">
              <svg className="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>
        
        <h1 className="text-5xl font-bold gradient-text mb-6">
          데이터베이스 모델링을 시작하세요
        </h1>
        <p className="text-xl text-surface-600 mb-12 leading-relaxed max-w-2xl mx-auto">
          직관적인 드래그 앤 드롭 인터페이스로 <span className="font-semibold text-primary-600">MSSQL 데이터베이스</span>를 설계하고, 
          실시간으로 SQL 스크립트를 생성해보세요.
        </p>
        
        {projects.length > 0 ? (
          <div className="bg-gradient-to-br from-white to-surface-50 rounded-2xl shadow-medium p-8 mb-12 border border-surface-200/50">
            <h3 className="text-2xl font-bold text-surface-800 mb-6 flex items-center justify-center">
              <span className="mr-3 text-3xl">🚀</span>
              최근 프로젝트
            </h3>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {projects.slice(0, 6).map((project) => (
                <div
                  key={project.id}
                  className="group relative p-6 bg-gradient-to-br from-white to-surface-50 border border-surface-200 rounded-xl hover:shadow-strong cursor-pointer transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                  onClick={() => onProjectSelect(project)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                  
                  <div className="relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-surface-800 truncate group-hover:text-primary-600 text-lg mb-2 transition-colors">
                          {project.name}
                        </h4>
                        {project.description && (
                          <p className="text-sm text-surface-600 line-clamp-3 leading-relaxed">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-200">
                      <div className="flex items-center space-x-4 text-xs text-surface-500 font-medium">
                        <div className="flex items-center space-x-1">
                          <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                          <span>{project.tables?.length || 0} 테이블</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="w-2 h-2 bg-accent-400 rounded-full"></span>
                          <span>{project.tables?.reduce((sum, table) => sum + (table.columns?.length || 0), 0) || 0} 컬럼</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 opacity-60 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onProjectEdit(project);
                          }}
                          className="p-2.5 rounded-xl bg-gradient-to-r from-primary-200 to-primary-300 text-primary-700 hover:from-primary-300 hover:to-primary-400 hover:text-primary-800 hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 border border-primary-300/50"
                          title="프로젝트 편집"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onProjectDelete(project.id);
                          }}
                          className="p-2.5 rounded-xl bg-gradient-to-r from-error-200 to-error-300 text-error-700 hover:from-error-300 hover:to-error-400 hover:text-error-800 hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 border border-error-300/50"
                          title="프로젝트 삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-surface-400">
                      {new Date(project.updatedAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-surface-50 to-surface-100 rounded-2xl p-12 mb-12 border-2 border-dashed border-surface-300">
            <div className="text-6xl mb-4">🏗️</div>
            <h3 className="text-2xl font-bold text-surface-700 mb-4">
              첫 번째 프로젝트를 만들어보세요
            </h3>
            <p className="text-surface-600 text-lg leading-relaxed max-w-md mx-auto">
              아직 생성된 프로젝트가 없습니다.<br/>
              새로운 데이터베이스 프로젝트를 생성하여 모델링을 시작해보세요.
            </p>
          </div>
        )}
        
        {/* CTA 버튼 */}
        <div className="space-y-4">
          <Button
            onClick={onShowCreateModal}
            variant="primary"
            size="lg"
            className="px-12 py-4 text-lg font-bold shadow-colored"
          >
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 프로젝트 생성하기
          </Button>
          
          <p className="text-sm text-surface-500 font-medium">
            🎯 무료로 시작하세요 • 💾 자동 저장 • ⚡ 실시간 미리보기
          </p>
        </div>
        
        {/* 기능 하이라이트 */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-lg font-bold text-surface-800 mb-2">직관적인 설계</h3>
            <p className="text-surface-600 text-sm">드래그 앤 드롭으로 테이블과 관계를 쉽게 설계하세요.</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-100 to-accent-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-bold text-surface-800 mb-2">실시간 검증</h3>
            <p className="text-surface-600 text-sm">MSSQL 명명 규칙을 실시간으로 검증하고 피드백을 제공합니다.</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-success-100 to-success-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📁</span>
            </div>
            <h3 className="text-lg font-bold text-surface-800 mb-2">SQL 생성</h3>
            <p className="text-surface-600 text-sm">완성된 스키마를 MSSQL 배포용 SQL 스크립트로 자동 생성합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;