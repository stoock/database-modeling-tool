import React, { useState, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import IndexList from '../IndexManager/IndexList';
import IndexForm from '../IndexManager/IndexForm';
import IndexPerformancePanel from '../IndexManager/IndexPerformancePanel';
import IndexSqlPreview from '../IndexManager/IndexSqlPreview';
import type { Table, Index } from '../../types';

interface IndexManagerPanelProps {
  selectedTable: Table | null;
  className?: string;
}

/**
 * 인덱스 관리 패널 컴포넌트
 * - 선택된 테이블의 인덱스 관리 인터페이스
 * - 인덱스 추가, 편집, 삭제 기능
 * - 성능 분석 및 SQL 미리보기
 */
const IndexManagerPanel: React.FC<IndexManagerPanelProps> = ({
  selectedTable,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'form' | 'performance' | 'sql'>('list');
  const [editingIndex, setEditingIndex] = useState<Index | null>(null);
  const [selectedIndex] = useState<Index | null>(null);
  const [, setIsCreating] = useState(false);

  // 인덱스 편집 핸들러
  const handleEditIndex = useCallback((index: Index) => {
    setEditingIndex(index);
    setActiveTab('form');
    setIsCreating(false);
  }, []);

  // 새 인덱스 추가 핸들러
  const handleAddIndex = useCallback(() => {
    setEditingIndex(null);
    setActiveTab('form');
    setIsCreating(true);
  }, []);

  // 인덱스 저장 핸들러 (현재 미사용)
  /*
  const handleSaveIndex = useCallback(async (indexData: CreateIndexRequest) => {
    if (!selectedTable) return;

    try {
      if (isCreating) {
        await createIndex(selectedTable.id, indexData);
      } else if (editingIndex) {
        await updateIndex(editingIndex.id, indexData);
      }
      
      setActiveTab('list');
      setEditingIndex(null);
      setIsCreating(false);
    } catch (error) {
      console.error('인덱스 저장 실패:', error);
      alert('인덱스 저장에 실패했습니다. 다시 시도해주세요.');
    }
  }, [selectedTable, isCreating, editingIndex, createIndex, updateIndex]);
  */

  // 폼 취소 핸들러
  const handleCancelForm = useCallback(() => {
    setActiveTab('list');
    setEditingIndex(null);
    setIsCreating(false);
  }, []);

  if (!selectedTable) {
    return (
      <div className={`bg-white shadow rounded-lg ${className}`}>
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">테이블을 선택해주세요.</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'list', name: '인덱스 목록', count: selectedTable.indexes.length },
    { id: 'performance', name: '성능 분석' },
    { id: 'sql', name: 'SQL 미리보기' },
  ];

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            인덱스 관리 - {selectedTable.name}
          </h3>
          {activeTab === 'list' && (
            <Button onClick={handleAddIndex} size="sm">
              <PlusIcon className="h-4 w-4 mr-1" />
              인덱스 추가
            </Button>
          )}
        </div>

        {/* 탭 네비게이션 */}
        {activeTab !== 'form' && (
          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  {tab.count !== undefined && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* 탭 컨텐츠 */}
        {activeTab === 'list' && (
          <IndexList
            indexes={selectedTable.indexes}
            columns={selectedTable.columns}
            onEdit={handleEditIndex}
          />
        )}

        {activeTab === 'form' && (
          <IndexForm
            tableId={selectedTable.id}
            index={editingIndex}
            columns={selectedTable.columns}
            onCancel={handleCancelForm}
            onSuccess={() => {
              setActiveTab('list');
              setEditingIndex(null);
            }}
          />
        )}

        {activeTab === 'performance' && selectedIndex && (
          <IndexPerformancePanel
            index={selectedIndex}
            table={selectedTable}
          />
        )}

        {activeTab === 'sql' && selectedIndex && (
          <IndexSqlPreview
            index={selectedIndex}
            table={selectedTable}
          />
        )}

        {(activeTab === 'performance' || activeTab === 'sql') && !selectedIndex && (
          <div className="text-center py-8 text-gray-500">
            먼저 인덱스를 선택해주세요.
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexManagerPanel;