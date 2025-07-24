import React, { useState } from 'react';
import { 
  CalendarIcon, 
  DocumentTextIcon, 
  TableCellsIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useProjectStore } from '../../stores/projectStore';
import { Button } from '../common';
import type { Project } from '../../types';

interface ProjectMetadataProps {
  project: Project;
  onEdit?: () => void;
  className?: string;
}

export const ProjectMetadata: React.FC<ProjectMetadataProps> = ({
  project,
  onEdit,
  className = ''
}) => {
  const { deleteProject } = useProjectStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `프로젝트 "${project.name}"을(를) 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 테이블과 데이터가 함께 삭제됩니다.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteProject(project.id);
    } catch (error) {
      console.error('프로젝트 삭제 실패:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getProjectStats = () => {
    const tables = project.tables || [];
    const totalColumns = tables.reduce((sum, table) => sum + (table.columns?.length || 0), 0);
    const totalIndexes = tables.reduce((sum, table) => sum + (table.indexes?.length || 0), 0);
    
    return {
      tableCount: tables.length,
      columnCount: totalColumns,
      indexCount: totalIndexes
    };
  };

  const stats = getProjectStats();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
            {project.description && (
              <p className="text-sm text-gray-600 mt-1">{project.description}</p>
            )}
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onEdit}
              >
                편집
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </div>
      </div>

      {/* 통계 정보 */}
      <div className="px-6 py-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">프로젝트 통계</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
              <TableCellsIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.tableCount}</div>
            <div className="text-sm text-gray-500">테이블</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
              <DocumentTextIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.columnCount}</div>
            <div className="text-sm text-gray-500">컬럼</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.indexCount}</div>
            <div className="text-sm text-gray-500">인덱스</div>
          </div>
        </div>
      </div>

      {/* 메타데이터 정보 */}
      <div className="px-6 py-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">프로젝트 정보</h4>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <CalendarIcon className="w-4 h-4 text-gray-400 mr-3" />
            <span className="text-gray-500 w-16">생성일:</span>
            <span className="text-gray-900">{formatDate(project.createdAt)}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <ClockIcon className="w-4 h-4 text-gray-400 mr-3" />
            <span className="text-gray-500 w-16">수정일:</span>
            <span className="text-gray-900">{formatDate(project.updatedAt)}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <UserIcon className="w-4 h-4 text-gray-400 mr-3" />
            <span className="text-gray-500 w-16">ID:</span>
            <span className="text-gray-900 font-mono text-xs">{project.id}</span>
          </div>
        </div>
      </div>

      {/* 네이밍 규칙 정보 */}
      {project.namingRules && (
        <div className="px-6 py-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">네이밍 규칙</h4>
          <div className="space-y-2 text-sm">
            {project.namingRules.tablePrefix && (
              <div className="flex justify-between">
                <span className="text-gray-500">테이블 접두사:</span>
                <span className="text-gray-900 font-mono">{project.namingRules.tablePrefix}</span>
              </div>
            )}
            
            {project.namingRules.tableSuffix && (
              <div className="flex justify-between">
                <span className="text-gray-500">테이블 접미사:</span>
                <span className="text-gray-900 font-mono">{project.namingRules.tableSuffix}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-500">대소문자 규칙:</span>
              <span className="text-gray-900">
                {project.namingRules.enforceCase === 'PASCAL' && 'PascalCase'}
                {project.namingRules.enforceCase === 'SNAKE' && 'snake_case'}
                {project.namingRules.enforceCase === 'UPPER' && 'UPPERCASE'}
                {project.namingRules.enforceCase === 'LOWER' && 'lowercase'}
              </span>
            </div>
            
            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500 space-y-1">
                <div>테이블: <code className="bg-gray-100 px-1 rounded">{project.namingRules.tablePattern}</code></div>
                <div>컬럼: <code className="bg-gray-100 px-1 rounded">{project.namingRules.columnPattern}</code></div>
                <div>인덱스: <code className="bg-gray-100 px-1 rounded">{project.namingRules.indexPattern}</code></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 최근 활동 */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">최근 활동</span>
          <span className="text-gray-900">
            {new Date(project.updatedAt).toLocaleDateString('ko-KR')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectMetadata;