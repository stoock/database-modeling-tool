import React from 'react';
import { ValidationDashboard } from '../ValidationPanel';
import type { Project } from '../../types';

interface ValidationPanelProps {
  currentProject: Project | null;
  className?: string;
}

/**
 * 검증 패널 컴포넌트
 * - 프로젝트 스키마 검증 결과 표시
 * - 네이밍 규칙 설정 및 관리
 * - 검증 가이드 및 해결 방안 제공
 */
const ValidationPanel: React.FC<ValidationPanelProps> = ({
  currentProject,
  className = ''
}) => {
  if (!currentProject) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-500">프로젝트를 선택해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ValidationDashboard projectId={currentProject.id} />
    </div>
  );
};

export default ValidationPanel;