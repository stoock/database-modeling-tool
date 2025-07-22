import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProjectStore } from './stores/projectStore';
import { useTableStore } from './stores/tableStore';
import { useValidationStore } from './stores/validationStore';
import { TableCanvas } from './components/TableDesigner';
import { ChangeIndicator, UnsavedChangesDialog, AutoSaveSettings, SaveFeedback } from './components/ChangeTracker';
import { useChangeTracker } from './utils/changeTracker';
import { useAutoSave } from './utils/autoSave';
import './App.css';

function App() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, currentProject, loadProjects, loadProject, updateProject, setCurrentProject, isLoading, error } = useProjectStore();
  const { tables, loadTables, updateTable } = useTableStore();
  const { clearValidations } = useValidationStore();
  const changeTracker = useChangeTracker();
  const [saveFeedbackStatus, setSaveFeedbackStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
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
  
  // 모든 변경사항 저장
  const saveAllChanges = async () => {
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
      
      return true;
    } catch (error) {
      console.error('변경사항 저장 중 오류 발생:', error);
      setSaveFeedbackStatus('error');
      return false;
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
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                MSSQL 데이터베이스 모델링 도구
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {currentProject && (
                <span className="text-sm text-gray-600">
                  프로젝트: {currentProject.name}
                </span>
              )}
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
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                프로젝트를 선택하거나 생성하세요
              </h2>
              <p className="text-gray-600 mb-8">
                데이터베이스 모델링을 시작하려면 먼저 프로젝트가 필요합니다.
              </p>
              
              {projects.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">기존 프로젝트</h3>
                  <div className="grid gap-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                        onClick={() => useProjectStore.getState().setCurrentProject(project)}
                      >
                        <h4 className="font-medium text-gray-900">{project.name}</h4>
                        {project.description && (
                          <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          테이블 {project.tables?.length || 0}개
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p>아직 생성된 프로젝트가 없습니다.</p>
                </div>
              )}
              
              <button className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                새 프로젝트 생성
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 프로젝트 개요 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  프로젝트 개요
                </h2>
                <div className="flex space-x-3">
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
        )}
      </main>
    </div>
  );
}

export default App
