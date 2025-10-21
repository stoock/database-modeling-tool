import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useTableStore } from '../../stores/tableStore';
import Button from '../common/Button';
import Input from '../common/Input';
import type { Table } from '../../types';

interface TableSectionProps {
  disabled?: boolean;
}

/**
 * 테이블 관리 섹션
 * - 현재 프로젝트의 테이블 목록 표시
 * - 테이블 선택 기능
 * - 새 테이블 추가 (인라인 폼)
 * - 테이블 삭제 기능
 */
const TableSection: React.FC<TableSectionProps> = ({ disabled = false }) => {
  const { currentProject } = useProjectStore();
  const {
    tables,
    selectedTable,
    isLoading,
    loadTables,
    setSelectedTable,
    createTable,
    deleteTable,
    updateTable
  } = useTableStore();

  // 로컬 상태
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableKoreanName, setNewTableKoreanName] = useState('');
  const [newTableDescription, setNewTableDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingTableId, setDeletingTableId] = useState<string | null>(null);
  
  // 수정 관련 상태
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editTableName, setEditTableName] = useState('');
  const [editTableKoreanName, setEditTableKoreanName] = useState('');
  const [editTableDescription, setEditTableDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // 현재 프로젝트가 변경될 때 테이블 목록 로드
  useEffect(() => {
    if (currentProject?.id) {
      loadTables(currentProject.id);
    }
  }, [currentProject?.id, loadTables]);

  // 테이블 선택 핸들러
  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
  };

  // 새 테이블 생성 핸들러
  const handleCreateTable = async () => {
    if (!newTableName.trim() || !newTableKoreanName.trim() || !currentProject?.id) return;

    setIsCreating(true);
    try {
      // 한글명을 설명에 포함하여 저장
      const description = newTableDescription.trim() 
        ? `${newTableKoreanName.trim()} - ${newTableDescription.trim()}`
        : newTableKoreanName.trim();
        
      const newTable = await createTable(currentProject.id, {
        name: newTableName.trim(),
        description: description
      });
      
      // 생성된 테이블을 선택
      setSelectedTable(newTable);
      
      // 폼 초기화
      setNewTableName('');
      setNewTableKoreanName('');
      setNewTableDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('테이블 생성 실패:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // 테이블 삭제 핸들러
  const handleDeleteTable = async (tableId: string) => {
    setDeletingTableId(tableId);
    try {
      await deleteTable(tableId);
      
      // 삭제된 테이블이 선택된 테이블이면 선택 해제
      if (selectedTable?.id === tableId) {
        setSelectedTable(null);
      }
    } catch (error) {
      console.error('테이블 삭제 실패:', error);
    } finally {
      setDeletingTableId(null);
    }
  };

  // 새 테이블 폼 취소
  const handleCancelCreate = () => {
    setNewTableName('');
    setNewTableKoreanName('');
    setNewTableDescription('');
    setShowCreateForm(false);
  };

  // 테이블 수정 시작
  const handleEditTable = (table: Table) => {
    setEditingTableId(table.id);
    setEditTableName(table.name);
    
    // 설명에서 한글명과 설명 분리
    const description = table.description || '';
    const dashIndex = description.indexOf(' - ');
    if (dashIndex > 0) {
      setEditTableKoreanName(description.substring(0, dashIndex));
      setEditTableDescription(description.substring(dashIndex + 3));
    } else {
      setEditTableKoreanName(description);
      setEditTableDescription('');
    }
  };

  // 테이블 수정 저장
  const handleUpdateTable = async () => {
    if (!editingTableId || !editTableName.trim() || !editTableKoreanName.trim()) return;

    setIsUpdating(true);
    try {
      // 한글명을 설명에 포함하여 저장
      const description = editTableDescription.trim() 
        ? `${editTableKoreanName.trim()} - ${editTableDescription.trim()}`
        : editTableKoreanName.trim();
        
      const updatedTable = await updateTable(editingTableId, {
        name: editTableName.trim(),
        description: description
      });
      
      // 선택된 테이블이 수정된 테이블이면 업데이트
      if (selectedTable?.id === editingTableId) {
        setSelectedTable(updatedTable);
      }
      
      // 수정 모드 종료
      setEditingTableId(null);
      setEditTableName('');
      setEditTableKoreanName('');
      setEditTableDescription('');
    } catch (error) {
      console.error('테이블 수정 실패:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 테이블 수정 취소
  const handleCancelEdit = () => {
    setEditingTableId(null);
    setEditTableName('');
    setEditTableKoreanName('');
    setEditTableDescription('');
  };

  if (disabled || !currentProject) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">프로젝트를 먼저 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* 테이블 목록 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-700">
            테이블 목록 ({tables.length}개)
          </h3>
          <Button
            onClick={() => setShowCreateForm(true)}
            disabled={showCreateForm}
            variant="outline"
            size="sm"
          >
            + 새 테이블
          </Button>
        </div>

        {/* 테이블 수평 스크롤 리스트 */}
        {tables.length > 0 ? (
          <div className="relative">
            {/* 스크롤 화살표 버튼 (테이블이 많을 때) */}
            {tables.length > 4 && (
              <>
                <button 
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 border border-gray-400 hover:bg-gray-100 hover:border-gray-500 transition-all"
                  onClick={() => {
                    const container = document.getElementById('table-scroll-container');
                    if (container) container.scrollLeft -= 200;
                  }}
                >
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 border border-gray-400 hover:bg-gray-100 hover:border-gray-500 transition-all"
                  onClick={() => {
                    const container = document.getElementById('table-scroll-container');
                    if (container) container.scrollLeft += 200;
                  }}
                >
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* 수평 스크롤 컨테이너 */}
            <div 
              id="table-scroll-container"
              className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
              style={{ scrollbarWidth: 'thin' }}
            >
              {tables.map((table) => (
                <div
                  key={table.id}
                  className={`
                    relative border rounded-lg p-4 cursor-pointer transition-all duration-200 flex-shrink-0 w-64
                    ${selectedTable?.id === table.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                  onClick={() => handleTableSelect(table)}
                >
                  {editingTableId === table.id ? (
                    // 수정 모드
                    <div className="space-y-3">
                      <div>
                        <Input
                          type="text"
                          value={editTableName}
                          onChange={(e) => setEditTableName(e.target.value)}
                          placeholder="테이블명 (영문)"
                          disabled={isUpdating}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          type="text"
                          value={editTableKoreanName}
                          onChange={(e) => setEditTableKoreanName(e.target.value)}
                          placeholder="한글명 *"
                          disabled={isUpdating}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          type="text"
                          value={editTableDescription}
                          onChange={(e) => setEditTableDescription(e.target.value)}
                          placeholder="추가 설명 (선택)"
                          disabled={isUpdating}
                          className="text-sm"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                          className="text-xs"
                        >
                          취소
                        </Button>
                        <Button
                          onClick={handleUpdateTable}
                          variant="primary"
                          size="sm"
                          disabled={!editTableName.trim() || !editTableKoreanName.trim() || isUpdating}
                          className="text-xs"
                          style={{
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white',
                            border: 'none'
                          }}
                        >
                          {isUpdating ? '저장 중...' : '저장'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // 일반 모드
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        {/* 한글명 표시 (primary) */}
                        {table.description && (
                          <h4 className={`font-medium text-sm truncate ${
                            selectedTable?.id === table.id ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {table.description.includes(' - ') 
                              ? table.description.split(' - ')[0] 
                              : table.description
                            }
                          </h4>
                        )}
                        
                        {/* 영문명 표시 (secondary) */}
                        <p className={`text-xs mt-1 ${
                          selectedTable?.id === table.id ? 'text-blue-700' : 'text-gray-600'
                        }`}>
                          {table.name}
                        </p>
                        
                        {/* 추가 설명 (있는 경우) */}
                        {table.description && table.description.includes(' - ') && (
                          <p className={`text-xs mt-1 line-clamp-2 ${
                            selectedTable?.id === table.id ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {table.description.split(' - ')[1]}
                          </p>
                        )}
                        
                        <div className={`text-xs mt-2 ${
                          selectedTable?.id === table.id ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          컬럼: {table.columns?.length || 0}개
                        </div>
                      </div>
                      
                      {/* 액션 버튼들 */}
                      <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTable(table);
                          }}
                          className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all p-1 rounded-md"
                          title="테이블 수정"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`"${table.name}" 테이블을 삭제하시겠습니까?`)) {
                              handleDeleteTable(table.id);
                            }
                          }}
                          disabled={deletingTableId === table.id}
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all p-1 rounded-md"
                          title="테이블 삭제"
                        >
                          {deletingTableId === table.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border border-gray-300 border-t-red-500"></div>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* 스크롤 힌트 (많은 테이블이 있을 때) */}
            {tables.length > 4 && (
              <div className="text-center text-xs text-gray-500 mt-2">
                ← 좌우로 스크롤하여 더 많은 테이블을 확인하세요 →
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm">아직 생성된 테이블이 없습니다.</p>
            <p className="text-xs text-gray-400 mt-1">"+ 새 테이블" 버튼을 클릭하여 첫 번째 테이블을 만들어보세요.</p>
          </div>
        )}
      </div>


      {/* 새 테이블 생성 폼 */}
      {showCreateForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">새 테이블 생성</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                테이블명 (영문) *
              </label>
              <Input
                type="text"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                placeholder="영문 테이블명을 입력하세요 (예: User, OrderItem)"
                disabled={isCreating}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                한글명 *
              </label>
              <Input
                type="text"
                value={newTableKoreanName}
                onChange={(e) => setNewTableKoreanName(e.target.value)}
                placeholder="한글 테이블명을 입력하세요 (예: 사용자, 주문상품)"
                disabled={isCreating}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                추가 설명 (선택)
              </label>
              <Input
                type="text"
                value={newTableDescription}
                onChange={(e) => setNewTableDescription(e.target.value)}
                placeholder="테이블의 추가 설명을 입력하세요"
                disabled={isCreating}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                onClick={handleCancelCreate}
                variant="outline"
                size="sm"
                disabled={isCreating}
              >
                취소
              </Button>
              <Button
                onClick={handleCreateTable}
                variant="primary"
                size="sm"
                disabled={!newTableName.trim() || !newTableKoreanName.trim() || isCreating}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  border: 'none'
                }}
              >
                {isCreating ? '생성 중...' : '생성'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-green-600"></div>
            <span className="text-sm">테이블 목록을 불러오는 중...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableSection;