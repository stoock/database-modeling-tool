import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '../../stores/projectStore';
import { useTableStore } from '../../stores/tableStore';
import { useValidationStore } from '../../stores/validationStore';
import { useChangeTracker } from '../../utils/changeTracker';
import { useAutoSave } from '../../utils/autoSave';
import { UnsavedChangesDialog } from '../ChangeTracker';
import { ProjectCreateModal } from '../ProjectManager';
import DashboardLayout from './DashboardLayout';
import DashboardHeader from './DashboardHeader';
import ProjectOverview from './ProjectOverview';
import TableDesignerPanel from './TableDesignerPanel';
import ColumnEditorPanel from './ColumnEditorPanel';
import IndexManagerPanel from './IndexManagerPanel';
import ValidationPanel from './ValidationPanel';
import SchemaExportPanel from './SchemaExportPanel';
import WelcomeScreen from './WelcomeScreen';
import type { Project } from '../../types';

/**
 * 대시보드 메인 컴포넌트
 * - 전체 대시보드 레이아웃 및 상태 관리
 * - 프로젝트 및 테이블 상태 통합 관리
 * - 자동 저장 및 변경사항 추적
 */
const DashboardMain: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { 
    projects, 
    currentProject, 
    loadProjects, 
    loadProject, 
    deleteProject, 
    setCurrentProject, 
    isLoading, 
    error, 
    clearError 
  } = useProjectStore();
  
  const { tables, selectedTable, loadTables, updateTable } = useTableStore();
  const { clearValidations } = useValidationStore();
  const changeTracker = useChangeTracker();
  
  // 컴포넌트 상태
  const [saveFeedbackStatus, setSaveFeedbackStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedDashboardView, setSelectedDashboardView] = useState<'overview' | 'columns' | 'indexes' | 'export'>('overview');
  
  // 자동 저장 설정
  const autoSave = useAutoSave({
    onBeforeSave: () => {
      setSaveFeedbackStatus('saving');
      return true;
    },
    onAfterSave: () => {
      setSaveFeedbackStatus('success');
    }
  });

  // 초기 로딩
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // URL projectId 처리
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  // 현재 프로젝트 변경 시 테이블 로드
  useEffect(() => {
    if (currentProject) {
      loadTables(currentProject.id);
      clearValidations();
    }
  }, [currentProject, loadTables, clearValidations]);

  // 프로젝트 선택 핸들러
  const handleProjectSelect = useCallback((project: Project) => {
    setCurrentProject(project);
    clearError();
    setSelectedDashboardView('overview');
  }, [setCurrentProject, clearError]);

  // 프로젝트 생성 성공 핸들러
  const handleProjectCreateSuccess = useCallback((project: Project) => {
    setCurrentProject(project);
    setShowCreateModal(false);
    setSelectedDashboardView('overview');
  }, [setCurrentProject]);

  // 프로젝트 편집 핸들러
  const handleProjectEdit = useCallback((project: Project) => {
    setEditingProject(project);
    setShowEditModal(true);
  }, []);

  // 프로젝트 편집 성공 핸들러
  const handleProjectEditSuccess = useCallback((project: Project) => {
    if (currentProject?.id === project.id) {
      setCurrentProject(project);
    }
    setShowEditModal(false);
    setEditingProject(null);
  }, [currentProject?.id, setCurrentProject]);

  // 프로젝트 삭제 핸들러
  const handleProjectDelete = useCallback(async (projectId: string) => {
    const success = await deleteProject(projectId);
    if (success) {
      setShowDeleteConfirm(null);
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
      }
    }
  }, [deleteProject, currentProject?.id, setCurrentProject]);

  // 모든 변경사항 저장
  const saveAllChanges = useCallback(async (): Promise<void> => {
    if (!currentProject) return;
    
    const state = changeTracker.getState();
    
    try {
      setSaveFeedbackStatus('saving');
      
      // 테이블 변경사항 저장
      for (const tableId of state.pendingChanges.tables) {
        const table = tables.find(t => t.id === tableId);
        if (table) {
          await updateTable(tableId, {
            name: table.name,
            description: table.description,
            positionX: table.positionX,
            positionY: table.positionY
          });
        }
      }
      
      changeTracker.markAsSaved();
      setSaveFeedbackStatus('success');
    } catch (error) {
      console.error('변경사항 저장 중 오류 발생:', error);
      setSaveFeedbackStatus('error');
    }
  }, [currentProject, changeTracker, tables, updateTable]);

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">오류가 발생했습니다</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  // 헤더 컴포넌트
  const headerComponent = (
    <DashboardHeader
      currentProject={currentProject}
      showCreateModal={showCreateModal}
      saveFeedbackStatus={saveFeedbackStatus}
      onProjectSelect={handleProjectSelect}
      onProjectSettings={handleProjectEdit}
      onShowCreateModal={setShowCreateModal}
      onSaveAll={saveAllChanges}
      onDismissFeedback={() => setSaveFeedbackStatus('idle')}
      autoSaveInterval={autoSave.state.isEnabled ? autoSave.state.interval : 0}
    />
  );

  // 사이드바 컴포넌트
  const sidebarComponent = currentProject ? (
    <ValidationPanel currentProject={currentProject} />
  ) : null;

  // 메인 콘텐츠 렌더링
  const renderMainContent = () => {
    if (!currentProject) {
      return (
        <WelcomeScreen
          projects={projects}
          onProjectSelect={handleProjectSelect}
          onProjectEdit={handleProjectEdit}
          onProjectDelete={(id) => setShowDeleteConfirm(id)}
          onShowCreateModal={() => setShowCreateModal(true)}
        />
      );
    }

    return (
      <>
        {/* 프로젝트 개요 */}
        <ProjectOverview
          currentProject={currentProject}
          tables={tables}
          onEditProject={handleProjectEdit}
        />

        {/* 대시보드 뷰 선택 탭 */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: '테이블 설계', description: 'React Flow 캔버스' },
                { id: 'columns', name: '컬럼 관리', description: '선택된 테이블의 컬럼' },
                { id: 'indexes', name: '인덱스 관리', description: '성능 최적화' },
                { id: 'export', name: '스키마 내보내기', description: 'SQL 생성' }
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setSelectedDashboardView(view.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedDashboardView === view.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div>{view.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{view.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* 뷰 콘텐츠 */}
          <div className="p-6">
            {selectedDashboardView === 'overview' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    테이블 설계 캔버스
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    드래그 앤 드롭으로 테이블을 배치하고 관계를 설정하세요.
                  </p>
                </div>
                <div className="h-[600px]">
                  <TableDesignerPanel />
                </div>
              </div>
            )}

            {selectedDashboardView === 'columns' && (
              <ColumnEditorPanel selectedTable={selectedTable} />
            )}

            {selectedDashboardView === 'indexes' && (
              <IndexManagerPanel selectedTable={selectedTable} />
            )}

            {selectedDashboardView === 'export' && (
              <SchemaExportPanel />
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <DashboardLayout
        currentProject={currentProject}
        header={headerComponent}
        sidebar={sidebarComponent}
      >
        {renderMainContent()}
      </DashboardLayout>

      {/* 저장되지 않은 변경사항 경고 다이얼로그 */}
      <UnsavedChangesDialog />

      {/* 프로젝트 생성 모달 */}
      <ProjectCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleProjectCreateSuccess}
      />

      {/* 프로젝트 편집 모달 */}
      <ProjectCreateModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProject(null);
        }}
        project={editingProject}
        onSuccess={handleProjectEditSuccess}
      />

      {/* 프로젝트 삭제 확인 다이얼로그 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                프로젝트 삭제
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 테이블과 데이터가 영구적으로 삭제됩니다.
                </p>
              </div>
              <div className="flex justify-center space-x-3 px-4 py-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-white text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  취소
                </button>
                <button
                  onClick={() => handleProjectDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardMain;