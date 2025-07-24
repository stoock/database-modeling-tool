import React, { useState, useEffect } from 'react';
import ColumnManager from './ColumnManager';
import { useTableStore } from '../../stores/tableStore';
import { useProjectStore } from '../../stores/projectStore';
import type { Table, Project } from '../../types';

/**
 * 컬럼 관리 기능 데모 컴포넌트
 * 개발 및 테스트 목적으로 사용
 */
const ColumnManagerDemo: React.FC = () => {
  const { tables, selectedTable, setSelectedTable, loadTables } = useTableStore();
  const { projects, currentProject, setCurrentProject } = useProjectStore();
  const [isLoading, setIsLoading] = useState(true);

  // 더미 데이터 생성
  useEffect(() => {
    const createDummyData = async () => {
      try {
        // 더미 프로젝트가 없으면 생성
        if (projects.length === 0) {
          console.log('더미 데이터를 생성합니다...');
          // 실제 환경에서는 API를 통해 데이터를 로드합니다
        }
        
        // 첫 번째 프로젝트 선택
        if (projects.length > 0 && !currentProject) {
          setCurrentProject(projects[0]);
        }
        
        // 테이블 로드
        if (currentProject) {
          await loadTables(currentProject.id);
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    createDummyData();
  }, [projects, currentProject, setCurrentProject, loadTables]);

  // 테이블 선택 핸들러
  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            컬럼 관리 데모
          </h2>
          
          {/* 프로젝트 정보 */}
          {currentProject && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900">
                현재 프로젝트: {currentProject.name}
              </h3>
              {currentProject.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {currentProject.description}
                </p>
              )}
            </div>
          )}

          {/* 테이블 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              테이블 선택
            </label>
            <select
              value={selectedTable?.id || ''}
              onChange={(e) => {
                const table = tables.find(t => t.id === e.target.value);
                if (table) {
                  handleTableSelect(table);
                }
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">테이블을 선택하세요</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name} ({table.columns.length}개 컬럼)
                </option>
              ))}
            </select>
          </div>

          {/* 선택된 테이블 정보 */}
          {selectedTable && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900">
                선택된 테이블: {selectedTable.name}
              </h3>
              {selectedTable.description && (
                <p className="text-sm text-blue-700 mt-1">
                  {selectedTable.description}
                </p>
              )}
              <div className="text-sm text-blue-600 mt-2">
                컬럼 수: {selectedTable.columns.length}개
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 컬럼 관리자 */}
      <ColumnManager table={selectedTable} />

      {/* 개발 정보 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">
          개발 정보
        </h3>
        <div className="text-xs text-yellow-700 space-y-1">
          <div>• 이 컴포넌트는 컬럼 관리 기능의 데모입니다.</div>
          <div>• 실제 환경에서는 백엔드 API와 연동됩니다.</div>
          <div>• 키보드 단축키를 지원합니다 (? 버튼 클릭하여 확인).</div>
          <div>• 드래그앤드롭으로 컬럼 순서를 변경할 수 있습니다.</div>
        </div>
      </div>
    </div>
  );
};

export default ColumnManagerDemo;