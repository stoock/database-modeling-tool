import React, { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useProjectStore } from '../../stores/projectStore';
import { apiClient } from '../../services/api';
import type { ExportFormat } from '../../types';
import { addExportRecord } from '../../utils/exportHistory';

interface ExportOptionsProps {
  projectId: string;
  onOptionsChange: (options: {
    format: ExportFormat;
    includeComments: boolean;
    includeIndexes: boolean;
    includeConstraints: boolean;
  }) => void;
  onExportComplete?: (result: {
    content: string;
    filename: string;
    mimeType: string;
  }) => void;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({
  projectId,
  onOptionsChange,
  onExportComplete
}) => {
  const [format, setFormat] = useState<ExportFormat>('SQL');
  const [includeComments, setIncludeComments] = useState<boolean>(true);
  const [includeIndexes, setIncludeIndexes] = useState<boolean>(true);
  const [includeConstraints, setIncludeConstraints] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { currentProject } = useProjectStore();
  
  // 옵션 변경 시 상위 컴포넌트에 알림 - 현재 미사용
  /*
  const handleOptionChange = () => {
    onOptionsChange({
      format,
      includeComments,
      includeIndexes,
      includeConstraints
    });
  };
  */
  
  // 포맷 변경
  const handleFormatChange = (newFormat: ExportFormat) => {
    setFormat(newFormat);
    setTimeout(() => {
      onOptionsChange({
        format: newFormat,
        includeComments,
        includeIndexes,
        includeConstraints
      });
    }, 0);
  };
  
  // 주석 포함 옵션 변경
  const handleCommentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeComments(e.target.checked);
    setTimeout(() => {
      onOptionsChange({
        format,
        includeComments: e.target.checked,
        includeIndexes,
        includeConstraints
      });
    }, 0);
  };
  
  // 인덱스 포함 옵션 변경
  const handleIndexesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeIndexes(e.target.checked);
    setTimeout(() => {
      onOptionsChange({
        format,
        includeComments,
        includeIndexes: e.target.checked,
        includeConstraints
      });
    }, 0);
  };
  
  // 제약조건 포함 옵션 변경
  const handleConstraintsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeConstraints(e.target.checked);
    setTimeout(() => {
      onOptionsChange({
        format,
        includeComments,
        includeIndexes,
        includeConstraints: e.target.checked
      });
    }, 0);
  };
  
  // 파일 다운로드
  const handleDownload = async () => {
    if (!currentProject) return;
    
    setIsExporting(true);
    setError(null);
    
    try {
      const result = await apiClient.exportSchema(projectId, {
        format,
        includeComments,
        includeIndexes,
        includeConstraints
      });
      
      // 파일 다운로드 처리
      const blob = new Blob([result.content], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // 성공 기록 추가
      addExportRecord(projectId, format, result.filename, true);
      
      // 내보내기 완료 이벤트 발생
      if (onExportComplete) {
        onExportComplete(result);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '스키마 내보내기 중 오류가 발생했습니다.';
      setError(errorMessage);
      
      // 실패 기록 추가
      addExportRecord(projectId, format, `${currentProject?.name || 'unknown'}_${format.toLowerCase()}_${new Date().getTime()}.${format.toLowerCase()}`, false, errorMessage);
      
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };
  
  // 포맷별 파일 확장자
  const getFileExtension = () => {
    switch (format) {
      case 'SQL': return '.sql';
      case 'JSON': return '.json';
      case 'MARKDOWN': return '.md';
      case 'HTML': return '.html';
      case 'CSV': return '.csv';
      default: return '.txt';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">내보내기 옵션</h3>
      
      {error && (
        <div className="mb-4 bg-red-50 p-3 rounded-md text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      <div className="space-y-4">
        {/* 출력 형식 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            출력 형식
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {(['SQL', 'MARKDOWN', 'HTML', 'JSON', 'CSV'] as ExportFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => handleFormatChange(f)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  format === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        {/* 포함 옵션 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            포함 옵션
          </label>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeComments"
              checked={includeComments}
              onChange={handleCommentsChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="includeComments" className="ml-2 block text-sm text-gray-700">
              주석 포함
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeIndexes"
              checked={includeIndexes}
              onChange={handleIndexesChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="includeIndexes" className="ml-2 block text-sm text-gray-700">
              인덱스 포함
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeConstraints"
              checked={includeConstraints}
              onChange={handleConstraintsChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="includeConstraints" className="ml-2 block text-sm text-gray-700">
              제약조건 포함
            </label>
          </div>
        </div>
        
        {/* 다운로드 버튼 */}
        <div className="pt-2">
          <button
            onClick={handleDownload}
            disabled={isExporting || !currentProject}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                내보내는 중...
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                {currentProject ? `${currentProject.name}${getFileExtension()} 다운로드` : '다운로드'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportOptions;