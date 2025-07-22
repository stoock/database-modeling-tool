import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useTableStore } from '../../stores/tableStore';
import { useValidationStore } from '../../stores/validationStore';
import { useProjectStore } from '../../stores/projectStore';
import type { Table, Index, IndexColumn, Column } from '../../types';
import IndexList from '../IndexManager/IndexList';
import IndexForm from '../IndexManager/IndexForm';

interface IndexManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: string;
}

const IndexManagerModal: React.FC<IndexManagerModalProps> = ({
  isOpen,
  onClose,
  tableId
}) => {
  const { getTableById } = useTableStore();
  const { currentProject } = useProjectStore();
  const { validateIndex } = useValidationStore();
  
  const [table, setTable] = useState<Table | undefined>(undefined);
  const [selectedIndex, setSelectedIndex] = useState<Index | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 테이블 정보 로드
  useEffect(() => {
    if (isOpen && tableId) {
      const currentTable = getTableById(tableId);
      setTable(currentTable);
    }
  }, [isOpen, tableId, getTableById]);
  
  // 모달 닫을 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setSelectedIndex(null);
      setIsCreating(false);
      setError(null);
    }
  }, [isOpen]);
  
  // 인덱스 생성 모드 시작
  const handleCreateIndex = () => {
    setSelectedIndex(null);
    setIsCreating(true);
  };
  
  // 인덱스 편집 모드 시작
  const handleEditIndex = (index: Index) => {
    setSelectedIndex(index);
    setIsCreating(false);
  };
  
  // 폼 취소 처리
  const handleCancelForm = () => {
    setSelectedIndex(null);
    setIsCreating(false);
  };
  
  // 인덱스 목록 또는 폼 표시 결정
  const renderContent = () => {
    if (!table) return null;
    
    if (isCreating || selectedIndex) {
      return (
        <IndexForm
          tableId={tableId}
          index={selectedIndex}
          columns={table.columns}
          onCancel={handleCancelForm}
          onSuccess={() => {
            setSelectedIndex(null);
            setIsCreating(false);
          }}
        />
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            인덱스 목록
          </h3>
          <button
            onClick={handleCreateIndex}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            인덱스 추가
          </button>
        </div>
        
        <IndexList
          indexes={table.indexes}
          columns={table.columns}
          onEdit={handleEditIndex}
        />
      </div>
    );
  };
  
  return (
    <Dialog
      open={isOpen}
      onClose={() => !isSubmitting && onClose()}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              인덱스 관리 - {table?.name}
            </Dialog.Title>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-4">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            
            {renderContent()}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default IndexManagerModal;