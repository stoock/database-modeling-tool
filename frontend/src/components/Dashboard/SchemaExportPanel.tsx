import React from 'react';
import SchemaExportPanelComponent from '../SchemaExport/SchemaExportPanel';

/**
 * 대시보드용 스키마 내보내기 패널 래퍼 컴포넌트
 * - 기존 SchemaExportPanel 컴포넌트를 대시보드 레이아웃에 맞게 래핑
 */
const SchemaExportPanel: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <SchemaExportPanelComponent />
    </div>
  );
};

export default SchemaExportPanel;