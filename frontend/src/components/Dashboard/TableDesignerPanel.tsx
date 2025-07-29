import React from 'react';
import { TableCanvas } from '../TableDesigner';

/**
 * 테이블 설계 패널 컴포넌트
 * - React Flow 기반 테이블 설계 캔버스
 * - 고정된 높이로 스크롤 가능한 설계 영역 제공
 */
const TableDesignerPanel: React.FC = () => {
  return (
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
  );
};

export default TableDesignerPanel;