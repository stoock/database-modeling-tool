import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';
import { SchemaExportPanel } from '../components/SchemaExport';
import { PageHeader } from '../components/common';

const SchemaExportPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { loadProject, currentProject, isLoading, error } = useProjectStore();
  
  // 프로젝트 로드
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);
  
  // 오류 처리
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md text-red-700">
          <h2 className="text-lg font-medium">오류 발생</h2>
          <p className="mt-1">{error}</p>
          <button
            onClick={() => navigate('/projects')}
            className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          >
            프로젝트 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }
  
  // 로딩 상태
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  // 프로젝트가 없는 경우
  if (!currentProject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
          <h2 className="text-lg font-medium">프로젝트를 찾을 수 없습니다</h2>
          <p className="mt-1">요청하신 프로젝트를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/projects')}
            className="mt-3 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
          >
            프로젝트 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={`${currentProject.name} - 스키마 내보내기`}
        description="데이터베이스 스키마를 SQL 스크립트 또는 다른 형식으로 내보냅니다."
        backLink={`/projects/${currentProject.id}`}
        backText="프로젝트로 돌아가기"
      />
      
      <div className="mt-6">
        <SchemaExportPanel />
      </div>
    </div>
  );
};

export default SchemaExportPage;