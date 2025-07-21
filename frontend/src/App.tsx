import { useEffect } from 'react';
import { useProjectStore } from './stores/projectStore';
import { useTableStore } from './stores/tableStore';
import { useValidationStore } from './stores/validationStore';
import './App.css';

function App() {
  const { projects, currentProject, loadProjects, isLoading, error } = useProjectStore();
  const { tables, loadTables } = useTableStore();
  const { clearValidations } = useValidationStore();

  useEffect(() => {
    // 앱 시작 시 프로젝트 목록 로드
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    // 현재 프로젝트가 변경되면 테이블 목록 로드
    if (currentProject) {
      loadTables(currentProject.id);
      clearValidations();
    }
  }, [currentProject, loadTables, clearValidations]);

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
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">연결됨</span>
              </div>
            </div>
          </div>
        </div>
      </header>

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
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                프로젝트 개요
              </h2>
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

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  테이블 목록
                </h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  새 테이블 추가
                </button>
              </div>
              
              {tables.length > 0 ? (
                <div className="grid gap-4">
                  {tables.map((table) => (
                    <div
                      key={table.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{table.name}</h3>
                          {table.description && (
                            <p className="text-sm text-gray-600 mt-1">{table.description}</p>
                          )}
                          <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                            <span>컬럼 {table.columns.length}개</span>
                            <span>인덱스 {table.indexes.length}개</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            편집
                          </button>
                          <button className="text-red-600 hover:text-red-800 text-sm">
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>아직 생성된 테이블이 없습니다.</p>
                  <p className="text-sm mt-1">새 테이블을 추가하여 시작하세요.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App
