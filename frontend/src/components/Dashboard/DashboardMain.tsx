import React, { useState, useCallback, useEffect, useRef, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '../../stores/projectStore';
import { useTableStore } from '../../stores/tableStore';
import { useValidationStore } from '../../stores/validationStore';
import ChangeTracker from '../../utils/changeTracker';
import { useAutoSave } from '../../utils/autoSave';
import { UnsavedChangesDialog } from '../ChangeTracker';
import { ProjectCreateModal } from '../ProjectManager';
import DashboardLayout from './DashboardLayout';
import DashboardHeader from './DashboardHeader';
import ProjectOverview from './ProjectOverview';
import WelcomeScreen from './WelcomeScreen';
import Button from '../common/Button';
import type { Project } from '../../types';

// 무거운 컴포넌트들을 lazy loading으로 최적화
const TableDesignerPanel = lazy(() => import('./TableDesignerPanel'));
const ColumnEditorPanel = lazy(() => import('./ColumnEditorPanel'));
const IndexManagerPanel = lazy(() => import('./IndexManagerPanel'));
const ValidationPanel = lazy(() => import('./ValidationPanel'));
const SchemaExportPanel = lazy(() => import('./SchemaExportPanel'));

/**
 * 대시보드 메인 컴포넌트
 * - 전체 대시보드 레이아웃 및 상태 관리
 * - 프로젝트 및 테이블 상태 통합 관리
 * - 자동 저장 및 변경사항 추적
 */
const DashboardMain: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  // 필요한 상태만 선택적으로 구독하여 불필요한 리렌더링 방지
  const projects = useProjectStore((state) => state.projects);
  const currentProject = useProjectStore((state) => state.currentProject);
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const isLoading = useProjectStore((state) => state.isLoading);
  const error = useProjectStore((state) => state.error);
  const clearError = useProjectStore((state) => state.clearError);
  
  const { tables, selectedTable, updateTable } = useTableStore();
  // loadTables와 clearValidations는 useEffect 내에서 직접 호출
  
  // 컴포넌트 상태
  const [saveFeedbackStatus, setSaveFeedbackStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedDashboardView, setSelectedDashboardView] = useState<'overview' | 'columns' | 'indexes' | 'export'>('overview');
  
  // 자동 저장 콜백 함수들을 useCallback으로 메모화
  const onBeforeSave = useCallback(() => {
    setSaveFeedbackStatus('saving');
    return true;
  }, []);

  const onAfterSave = useCallback(() => {
    setSaveFeedbackStatus('success');
  }, []);

  // 자동 저장 설정 (활성화됨)
  const autoSave = useAutoSave({
    enabled: true, // 자동 저장 기능 활성화
    onBeforeSave,
    onAfterSave
  });

  // 전역 상태로 한 번만 실행되도록 보장
  const hasInitialized = useRef(false);

  // 초기 로딩 - 정말로 한 번만 실행
  useEffect(() => {
    // 이미 초기화되었거나 현재 로딩 중이면 건너뛰기
    if (hasInitialized.current || isLoading) {
      return;
    }

    hasInitialized.current = true;
    console.log('프로젝트 목록 초기 로딩 시작');
    
    const { loadProjects } = useProjectStore.getState();
    loadProjects().catch((error) => {
      console.error('초기 프로젝트 로딩 실패:', error);
      // 실패해도 재시도하지 않음 - 사용자가 수동으로 재시도해야 함
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // URL projectId 처리
  useEffect(() => {
    if (projectId) {
      const { loadProject } = useProjectStore.getState();
      loadProject(projectId);
    }
  }, [projectId]); // 오직 projectId만 의존성

  // 현재 프로젝트 변경 시 테이블 로드
  useEffect(() => {
    if (currentProject?.id) {
      const { loadTables } = useTableStore.getState();
      const { clearValidations } = useValidationStore.getState();
      loadTables(currentProject.id);
      clearValidations();
    }
  }, [currentProject?.id]); // currentProject.id만 의존성으로 사용

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
    
    const changeTracker = ChangeTracker.getInstance();
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
      console.error('Error occurred while saving changes:', error);
      setSaveFeedbackStatus('error');
    }
  }, [currentProject, tables, updateTable]);

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-surface-50 to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-600 to-accent-500 opacity-20 animate-pulse"></div>
          </div>
          <p className="mt-6 text-surface-600 font-medium text-lg">데이터베이스 모델링 도구 로딩 중...</p>
          <div className="mt-2 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-error-50 via-surface-50 to-warning-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-error-100 to-error-200 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-surface-800 mb-3">오류가 발생했습니다</h2>
          <p className="text-surface-600 mb-6 leading-relaxed">{error}</p>
          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              variant="primary"
              className="w-full"
            >
              새로고침
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              이전 페이지로
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 헤더 컴포넌트
  const headerComponent = (
    <DashboardHeader
      currentProject={currentProject}
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
    <Suspense fallback={
      <div className="p-4 animate-pulse bg-gradient-to-br from-surface-50 to-surface-100 rounded-xl border border-surface-200">
        <div className="space-y-3">
          <div className="h-4 bg-surface-200 rounded-lg animate-pulse"></div>
          <div className="h-3 bg-surface-200 rounded-lg w-3/4 animate-pulse"></div>
          <div className="h-3 bg-surface-200 rounded-lg w-1/2 animate-pulse"></div>
        </div>
      </div>
    }>
      <ValidationPanel currentProject={currentProject} />
    </Suspense>
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
        <div className="bg-gradient-to-r from-white to-surface-50 rounded-2xl shadow-soft border border-surface-200/50">
          <div className="border-b border-surface-200/70">
            <nav className="flex space-x-2 px-6">
              {[
                { id: 'overview', name: '테이블 설계', description: 'React Flow 캔버스', icon: '🎨' },
                { id: 'columns', name: '컬럼 관리', description: '선택된 테이블의 컬럼', icon: '📊' },
                { id: 'indexes', name: '인덱스 관리', description: '성능 최적화', icon: '⚡' },
                { id: 'export', name: '스키마 내보내기', description: 'SQL 생성', icon: '📁' }
              ].map((view) => (
                <Button
                  key={view.id}
                  onClick={() => setSelectedDashboardView(view.id as 'overview' | 'columns' | 'indexes' | 'export')}
                  variant={selectedDashboardView === view.id ? 'primary' : 'ghost'}
                  size="md"
                  className={`py-4 px-4 relative transition-all duration-300 ${
                    selectedDashboardView === view.id 
                      ? 'shadow-colored transform -translate-y-1 !text-white !bg-gradient-to-r !from-primary-600 !to-primary-700' 
                      : 'hover:transform hover:-translate-y-0.5 hover:!text-primary-700 hover:!bg-gradient-to-r hover:!from-primary-50 hover:!to-primary-100'
                  }`}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <span className="text-base">{view.icon}</span>
                      <span className={`font-bold ${selectedDashboardView === view.id ? 'text-white' : 'text-surface-800'}`}>{view.name}</span>
                    </div>
                    <div className={`text-xs ${selectedDashboardView === view.id ? 'text-white/90' : 'text-surface-600 opacity-75'}`}>{view.description}</div>
                  </div>
                  {selectedDashboardView === view.id && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-white to-white/80 rounded-full"></div>
                  )}
                </Button>
              ))}
            </nav>
          </div>

          {/* 뷰 콘텐츠 */}
          <div className="p-8">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-600 to-accent-500 opacity-10 animate-pulse"></div>
                </div>
                <span className="ml-4 text-surface-600 font-medium">컴포넌트 로딩 중...</span>
              </div>
            }>
              {selectedDashboardView === 'overview' && (
                <TableDesignerPanel />
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
            </Suspense>
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
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-8 w-96 max-w-md shadow-strong rounded-2xl bg-gradient-to-br from-white to-surface-50 border border-surface-200 animate-scale">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-error-100 to-error-200 mb-6">
                <svg className="h-8 w-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-surface-800 mb-4">
                프로젝트 삭제
              </h3>
              <div className="mb-8">
                <p className="text-surface-600 leading-relaxed">
                  이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 테이블과 데이터가 영구적으로 삭제됩니다.
                </p>
              </div>
              <div className="flex space-x-4">
                <Button
                  onClick={() => setShowDeleteConfirm(null)}
                  variant="outline"
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={() => handleProjectDelete(showDeleteConfirm)}
                  variant="danger"
                  className="flex-1"
                >
                  삭제
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardMain;