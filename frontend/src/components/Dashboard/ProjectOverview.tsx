import React from 'react';
import { Link } from 'react-router-dom';
import type { Project, Table } from '../../types';

interface ProjectOverviewProps {
  currentProject: Project;
  tables: Table[];
  onEditProject: (project: Project) => void;
}

/**
 * 프로젝트 개요 대시보드 컴포넌트
 * - 프로젝트 통계 (테이블, 컬럼, 인덱스 개수)
 * - 프로젝트 편집 및 스키마 내보내기 액션
 */
const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  currentProject,
  tables,
  onEditProject
}) => {
  const totalColumns = tables.reduce((sum, table) => sum + table.columns.length, 0);
  const totalIndexes = tables.reduce((sum, table) => sum + table.indexes.length, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          프로젝트 개요
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={() => onEditProject(currentProject)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            프로젝트 편집
          </button>
          <Link
            to={`/projects/${currentProject.id}/export`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            스키마 내보내기
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {tables.length}
          </div>
          <div className="text-sm text-gray-600">테이블</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {totalColumns}
          </div>
          <div className="text-sm text-gray-600">컬럼</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {totalIndexes}
          </div>
          <div className="text-sm text-gray-600">인덱스</div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;