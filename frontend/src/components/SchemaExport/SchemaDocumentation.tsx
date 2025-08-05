import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useProjectStore } from '../../stores/projectStore';
import { apiClient } from '../../services/api';
// ExportFormat 현재 미사용
// import type { ExportFormat } from '../../types';

interface SchemaDocumentationProps {
  projectId: string;
}

const SchemaDocumentation: React.FC<SchemaDocumentationProps> = ({ projectId }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'markdown' | 'html'>('markdown');
  
  const { currentProject } = useProjectStore();
  
  // 문서 내용 로드
  useEffect(() => {
    const loadDocumentation = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // 마크다운 형식 로드
        const markdownResult = await apiClient.exportSchema(projectId, {
          format: 'MARKDOWN',
          includeComments: true,
          includeIndexes: true,
          includeConstraints: true
        });
        setMarkdownContent(markdownResult.content);
        
        // HTML 형식 로드
        const htmlResult = await apiClient.exportSchema(projectId, {
          format: 'HTML',
          includeComments: true,
          includeIndexes: true,
          includeConstraints: true
        });
        setHtmlContent(htmlResult.content);
      } catch (err: any) {
        setError(err.message || '문서를 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDocumentation();
  }, [projectId]);
  
  // 클립보드에 복사
  const handleCopy = () => {
    const content = activeTab === 'markdown' ? markdownContent : htmlContent;
    
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('클립보드 복사 실패:', err);
      });
  };
  
  // 문서 다운로드
  const handleDownload = () => {
    if (!currentProject) return;
    
    const content = activeTab === 'markdown' ? markdownContent : htmlContent;
    const extension = activeTab === 'markdown' ? '.md' : '.html';
    const mimeType = activeTab === 'markdown' ? 'text/markdown' : 'text/html';
    
    // 파일 다운로드 처리
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.name}_documentation${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="text-lg font-medium text-gray-900">
          스키마 문서화
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handleCopy}
            disabled={isLoading || (!markdownContent && !htmlContent)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {copied ? (
              <>
                <CheckIcon className="h-4 w-4 mr-1 text-green-500" />
                복사됨
              </>
            ) : (
              <>
                <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                복사
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            disabled={isLoading || (!markdownContent && !htmlContent)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <DocumentTextIcon className="h-4 w-4 mr-1" />
            다운로드
          </button>
        </div>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('markdown')}
            className={`py-3 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'markdown'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            마크다운
          </button>
          <button
            onClick={() => setActiveTab('html')}
            className={`py-3 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'html'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            HTML
          </button>
        </nav>
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
        ) : activeTab === 'markdown' && markdownContent ? (
          <div className="relative">
            <pre className="overflow-auto bg-gray-50 p-4 rounded-md text-sm h-64 font-mono">
              {markdownContent}
            </pre>
          </div>
        ) : activeTab === 'html' && htmlContent ? (
          <div className="relative">
            <pre className="overflow-auto bg-gray-50 p-4 rounded-md text-sm h-64 font-mono">
              {htmlContent}
            </pre>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-500">
            <p>문서화할 스키마가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemaDocumentation;