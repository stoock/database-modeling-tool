import React from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useTableStore } from '../stores/tableStore';
import { ProjectSection, TableSection, ColumnEditor, ValidationSection, ExportSection } from '../components/Simple';

/**
 * 간소화된 데이터베이스 모델링 대시보드
 * - 원페이지에 모든 필수 기능 통합
 * - ERD 스타일의 직관적인 컬럼 편집
 * - 기존 백엔드 API 100% 재사용
 */
const SimpleDashboard: React.FC = () => {
  // 전역 상태에서 필요한 데이터 구독
  const { currentProject } = useProjectStore();
  const { selectedTable } = useTableStore();
  
  // 로컬 상태 관리 (추후 필요시 활용)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* 헤더 (프로젝트 관리 통합) */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DB</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">데이터베이스 모델링 도구</h1>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                간소화 버전
              </span>
            </div>
            
            {/* 프로젝트 관리 */}
            <div className="flex items-center space-x-3">
              <ProjectSection />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="space-y-4">
          
          {/* 1. 테이블 관리 섹션 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-green-50 text-xs">📋</span>
                </div>
                <h2 className="text-base font-semibold text-gray-900">테이블 관리</h2>
                {!currentProject && (
                  <span className="text-xs text-gray-500">(프로젝트를 먼저 선택하세요)</span>
                )}
              </div>
            </div>
            <div className="p-4">
              <TableSection disabled={!currentProject} />
            </div>
          </section>

          {/* 2. 컬럼 편집 섹션 (ERD 스타일) */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-purple-50 text-xs">⚙️</span>
                </div>
                <h2 className="text-base font-semibold text-gray-900">컬럼 편집 (ERD 스타일)</h2>
                {!selectedTable && (
                  <span className="text-xs text-gray-500">(테이블을 먼저 선택하세요)</span>
                )}
              </div>
            </div>
            <div className="p-4">
              <ColumnEditor disabled={!selectedTable} />
            </div>
          </section>

          {/* 3 & 4. 검증 및 내보내기 합치기 (가로 배치) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 검증 결과 섹션 */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-yellow-50 text-xs">✅</span>
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">검증 결과</h2>
                </div>
              </div>
              <div className="p-4">
                <ValidationSection disabled={!currentProject} />
              </div>
            </section>

            {/* 스키마 내보내기 섹션 */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center">
                    <span className="text-indigo-50 text-xs">📤</span>
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">스키마 내보내기</h2>
                </div>
              </div>
              <div className="p-4">
                <ExportSection disabled={!currentProject} />
              </div>
            </section>
          </div>

        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-200 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>MSSQL 데이터베이스 모델링 도구 - 간소화 버전</span>
            <span>React 19 + TypeScript + Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimpleDashboard;