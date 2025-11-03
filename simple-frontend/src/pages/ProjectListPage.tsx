/**
 * 프로젝트 목록 페이지
 */

import React, { useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useUIStore } from '../stores/uiStore';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const ProjectListPage: React.FC = () => {
  const { projects, loading, error, fetchProjects, clearError } = useProjectStore();
  const { openModal } = useUIStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (loading && projects.length === 0) {
    return <LoadingSpinner size="lg" text="프로젝트 목록을 불러오는 중..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">프로젝트</h1>
          <p className="mt-2 text-gray-600">
            데이터베이스 모델링 프로젝트를 관리합니다
          </p>
        </div>
        <Button onClick={() => openModal('projectForm')}>
          새 프로젝트
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6">
          <ErrorMessage
            message={error}
            onRetry={fetchProjects}
            onDismiss={clearError}
          />
        </div>
      )}

      {/* 프로젝트 목록 */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            프로젝트가 없습니다
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            새 프로젝트를 생성하여 시작하세요
          </p>
          <div className="mt-6">
            <Button onClick={() => openModal('projectForm')}>
              새 프로젝트 생성
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>테이블 {project.tableCount}개</span>
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
