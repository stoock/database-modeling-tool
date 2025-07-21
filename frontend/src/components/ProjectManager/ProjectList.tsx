import React from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { Button } from '@/components/common';
import { formatDate } from '@/utils';
import type { Project } from '@/types';

interface ProjectListProps {
  onCreateProject: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onCreateProject }) => {
  const { projects, setCurrentProject, deleteProject, isLoading } = useProjectStore();

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
  };

  const handleDeleteProject = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm(`프로젝트 "${project.name}"을(를) 삭제하시겠습니까?`)) {
      await deleteProject(project.id);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            첫 번째 프로젝트를 생성하세요
          </h2>
          <p className="text-gray-600 mb-8">
            데이터베이스 모델링을 시작하려면 프로젝트가 필요합니다.
          </p>
          <Button onClick={onCreateProject} size="lg">
            새 프로젝트 생성
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">프로젝트 목록</h2>
        <Button onClick={onCreateProject}>
          새 프로젝트 생성
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleSelectProject(project)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {project.name}
                </h3>
                <button
                  onClick={(e) => handleDeleteProject(project, e)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="프로젝트 삭제"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {project.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>테이블</span>
                  <span className="font-medium">{project.tables?.length || 0}개</span>
                </div>
                <div className="flex justify-between">
                  <span>생성일</span>
                  <span>{formatDate(project.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>수정일</span>
                  <span>{formatDate(project.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">활성</span>
                </div>
                <span className="text-xs text-blue-600 font-medium">
                  열기 →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;