import React, { useState, useEffect } from 'react';
import { ClockIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useProjectStore } from '../../stores/projectStore';
import { getExportHistory, clearExportHistory, type ExportRecord } from '../../utils/exportHistory';

interface ExportHistoryProps {
  projectId?: string;
}

const ExportHistory: React.FC<ExportHistoryProps> = ({ projectId: propProjectId }) => {
  const { currentProject } = useProjectStore();
  const projectId = propProjectId || currentProject?.id;
  
  const [history, setHistory] = useState<ExportRecord[]>([]);

  useEffect(() => {
    if (!projectId) return;
    
    try {
      const exportHistory = getExportHistory(projectId);
      setHistory(exportHistory);
    } catch (err) {
      console.error('내보내기 기록을 불러오는 중 오류가 발생했습니다:', err);
    }
  }, [projectId]);
  
  // 파일 다운로드
  const handleDownload = (record: ExportRecord) => {
    // 실제 파일 다운로드 구현 필요
    console.log('파일 다운로드:', record.filename);
    // TODO: 서버에서 파일을 다시 생성하여 다운로드
  };

  // 기록 삭제
  const handleClear = () => {
    if (!projectId) return;
    
    if (window.confirm('모든 내보내기 기록을 삭제하시겠습니까?')) {
      clearExportHistory(projectId);
      setHistory([]);
    }
  };

  // 포맷별 아이콘
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'SQL':
        return '📄';
      case 'JSON':
        return '📋';
      case 'CSV':
        return '📊';
      default:
        return '📁';
    }
  };

  if (!projectId) {
    return (
      <div className="text-center py-8 text-gray-500">
        프로젝트를 먼저 선택해주세요.
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>아직 내보내기 기록이 없습니다.</p>
        <p className="text-sm mt-2">스키마를 내보내면 기록이 여기에 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">내보내기 기록</h3>
        <button
          onClick={handleClear}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          전체 삭제
        </button>
      </div>

      <div className="space-y-2">
        {history.map((record) => (
          <div
            key={record.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{getFormatIcon(record.format)}</span>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {record.filename}
                </p>
                <p className="text-xs text-gray-500">
                  {record.format} • {record.timestamp.toLocaleString('ko-KR')}
                </p>
                {!record.success && record.errorMessage && (
                  <p className="text-xs text-red-600 mt-1">
                    오류: {record.errorMessage}
                  </p>
                )}
              </div>
            </div>
            
            {record.success && (
              <button
                onClick={() => handleDownload(record)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="다시 다운로드"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExportHistory;