import React, { useState, useEffect } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
// useProjectStore 현재 미사용
// import { useProjectStore } from '../../stores/projectStore';
import { apiClient } from '../../services/api';
import type { ExportFormat } from '../../types';

interface SqlPreviewProps {
  projectId: string;
  format: ExportFormat;
  includeComments: boolean;
  includeIndexes: boolean;
  includeConstraints: boolean;
}

const SqlPreview: React.FC<SqlPreviewProps> = ({
  projectId,
  format,
  includeComments,
  includeIndexes,
  includeConstraints
}) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  
  // 스키마 내용 로드
  useEffect(() => {
    const loadSchema = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await apiClient.exportSchema(projectId, {
          format,
          includeComments,
          includeIndexes,
          includeConstraints
        });
        
        setContent(result.content);
      } catch (err: any) {
        setError(err.message || '스키마를 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSchema();
  }, [projectId, format, includeComments, includeIndexes, includeConstraints]);
  
  // 클립보드에 복사
  const handleCopy = () => {
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('클립보드 복사 실패:', err);
      });
  };
  
  // 코드 하이라이트 스타일 적용
  const getLanguageClass = () => {
    switch (format) {
      case 'SQL':
        return 'language-sql';
      case 'JSON':
        return 'language-json';
      case 'MARKDOWN':
        return 'language-markdown';
      case 'HTML':
        return 'language-html';
      case 'CSV':
        return 'language-csv';
      default:
        return 'language-plaintext';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="text-lg font-medium text-gray-900">
          {format === 'SQL' ? 'SQL 스크립트 미리보기' : `${format} 미리보기`}
        </h3>
        <button
          onClick={handleCopy}
          disabled={isLoading || !content}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {copied ? (
            <>
              <CheckIcon className="h-4 w-4 mr-1 text-green-500" />
              복사됨
            </>
          ) : (
            <>
              <ClipboardIcon className="h-4 w-4 mr-1" />
              복사
            </>
          )}
        </button>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-700">
            <p className="font-medium">오류 발생</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : content ? (
          <div className="relative">
            <pre className={`${getLanguageClass()} overflow-auto bg-gray-50 p-4 rounded-md text-sm h-64 font-mono`}>
              {content}
            </pre>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-500">
            <p>내보낼 스키마가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SqlPreview;