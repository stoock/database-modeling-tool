import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProjectStore } from './stores/projectStore';
import { useTableStore } from './stores/tableStore';
import { useValidationStore } from './stores/validationStore';
import { TableCanvas } from './components/TableDesigner';
import { ChangeIndicator, UnsavedChangesDialog, AutoSaveSettings, SaveFeedback } from './components/ChangeTracker';
import { ProjectSelector, ProjectCreateModal } from './components/ProjectManager';
import { ValidationDashboard } from './components/ValidationPanel';
import { useChangeTracker } from './utils/changeTracker';
import { useAutoSave } from './utils/autoSave';
import type { Project } from './types';
import './App.css';

function App() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, currentProject, loadProjects, loadProject, deleteProject, setCurrentProject, isLoading, error, clearError } = useProjectStore();
  const { tables, loadTables, updateTable } = useTableStore();
  const { clearValidations } = useValidationStore();
  const changeTracker = useChangeTracker();
  const [saveFeedbackStatus, setSaveFeedbackStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
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

  useEffect(() => {
    // 앱 시작 시 프로젝트 목록 로드
    loadProjects();
    
    // URL에 projectId가 있으면 해당 프로젝트 로드
    if (projectId) {
      loadProject(projectId);
    }
  }, [loadProjects, loadProject, projectId]);

  useEffect(() => {
    // 현재 프로젝트가 변경되면 테이블 목록 로드
    if (currentProject) {
      loadTables(currentProject.id);
      clearValidations();
    }
  }, [currentProject, loadTables, clearValidations]);
  
  // 프로젝트 선택 핸들러
  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    clearError();
  };

  // 프로젝트 생성 성공 핸들러
  const handleProjectCreateSuccess = (project: Project) => {
    setCurrentProject(project);
    setShowCreateModal(false);
  };

  // 프로젝트 편집 핸들러
  const handleProjectEdit = (project: Project) => {
    setEditingProject(project);
    setShowEditModal(true);
  };

  // 프로젝트 편집 성공 핸들러
  const handleProjectEditSuccess = (project: Project) => {
    if (currentProject?.id === project.id) {
      setCurrentProject(project);
    }
    setShowEditModal(false);
    setEditingProject(null);
  };

  // 프로젝트 삭제 핸들러
  const handleProjectDelete = async (projectId: string) => {
    const success = await deleteProject(projectId);
    if (success) {
      setShowDeleteConfirm(null);
      // 삭제된 프로젝트가 현재 선택된 프로젝트라면 null로 설정
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
      }
    }
  };

  // 모든 변경사항 저장
  const saveAllChanges = async (): Promise<void> => {
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
      
      // 모든 변경사항 저장 완료 표시
      changeTracker.markAsSaved();
      setSaveFeedbackStatus('success');
    } catch (error) {
      console.error('변경사항 저장 중 오류 발생:', error);
      setSaveFeedbackStatus('error');
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-semibold text-gray-900">
                MSSQL 데이터베이스 모델링 도구
              </h1>
              
              {/* 프로젝트 선택기 */}
              <div className="w-80">
                <ProjectSelector
                  onProjectSelect={handleProjectSelect}
                  onProjectSettings={handleProjectEdit}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 새 프로젝트 생성 버튼 */}
              <button
                onClick={() => setShowCreateModal(true)}
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
                    onSave={saveAllChanges}
                    autoSaveInterval={autoSave.state.isEnabled ? autoSave.state.interval : 0}
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
      </header>
      
      {/* 저장되지 않은 변경사항 경고 다이얼로그 */}
      <UnsavedChangesDialog />
      
      {/* 저장 상태 피드백 */}
      <SaveFeedback 
        status={saveFeedbackStatus} 
        onDismiss={() => setSaveFeedbackStatus('idle')}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentProject ? (
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
                        onClick={() => handleProjectSelect(project)}
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
                                handleProjectEdit(project);
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
                                setShowDeleteConfirm(project.id);
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
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                새 프로젝트 생성
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* 메인 콘텐츠 영역 */}
            <div className="xl:col-span-3 space-y-6">
              {/* 프로젝트 개요 */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    프로젝트 개요
                  </h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleProjectEdit(currentProject)}
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
                      {tables.reduce((sum, table) => sum + table.columns.length, 0)}
                    </div>
                    <div className="text-sm text-gray-600">컬럼</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {tables.reduce((sum, table) => sum + table.indexes.length, 0)}
                    </div>
                    <div className="text-sm text-gray-600">인덱스</div>
                  </div>
                </div>
              </div>

              {/* 테이블 설계 캔버스 */}
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
                  <TableCanvas />
                </div>
              </div>
            </div>

            {/* 사이드바 - 검증 패널 */}
            <div className="xl:col-span-1">
              <div className="sticky top-8">
                <ValidationDashboard projectId={currentProject.id} />
              </div>
            </div>
          </div>
        )}
      </main>

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
    </div>
  );
}

export default App
