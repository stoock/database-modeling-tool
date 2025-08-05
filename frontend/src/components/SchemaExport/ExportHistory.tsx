import React, { useState, useEffect } from 'react';
import { ClockIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useProjectStore } from '../../stores/projectStore';
import type { ExportFormat } from '../../types';

interface ExportRecord {
  id: string;
  timestamp: Date;
  format: ExportFormat;
  filename: string;
  content: string;
  mimeType: string;
}

interface ExportHistoryProps {
  projectId: string;
}

const ExportHistory: React.FC<ExportHistoryProps> = ({ projectId }) => {
  const [history, setHistory] = useState<ExportRecord[]>([]);
  useProjectStore(); // 현재 미사용
  
  // 내보내기 기록 로드 (로컬 스토리지에서)
  useEffect(() => {
    if (!projectId) return;
    
    try {
      const historyKey = `export_history_${projectId}`;
      const storedHistory = localStorage.getItem(historyKey);
      
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        // 날짜 문자열을 Date 객체로 변환
        const formattedHistory = parsedHistory.map((record: any) => ({
          ...record,
          timestamp: new Date(record.timestamp)
        }));
        setHistory(formattedHistory);
      }
    } catch (err) {
      console.error('내보내기 기록을 불러오는 중 오류가 발생했습니다:', err);
    }
  }, [projectId]);
  
  // 내보내기 기록 저장 (로컬 스토리지에) - 현재 미사용
  /*
  const saveExportRecord = (record: ExportRecord) => {
    if (!projectId) return;
    
    try {
      const historyKey = `export_history_${projectId}`;
      const updatedHistory = [record, ...history].slice(0, 10); // 최대 10개 기록 유지
      
      localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (err) {
      console.error('내보내기 기록을 저장하는 중 오류가 발생했습니다:', err);
    }
  };
  */
  
  // 파일 다운로드
  const handleDownload = (record: ExportRecord) => {
    const blob = new Blob([record.content], { type: record.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = record.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // 포맷 아이콘 및 색상
  const getFormatStyle = (format: ExportFormat) => {
    switch (format) {
      case 'SQL':
        return { bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
      case 'JSON':
        return { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
      case 'MARKDOWN':
        return { bgColor: 'bg-green-100', textColor: 'text-green-800' };
      case 'HTML':
        return { bgColor: 'bg-purple-100', textColor: 'text-purple-800' };
      case 'CSV':
        return { bgColor: 'bg-red-100', textColor: 'text-red-800' };
      default:
        return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };
  
  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="text-lg font-medium text-gray-900">
          내보내기 기록
        </h3>
      </div>
      
      <div className="p-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <ClockIcon className="h-12 w-12 mb-2" />
            <p>내보내기 기록이 없습니다.</p>
            <p className="text-sm mt-1">스키마를 내보내면 여기에 기록됩니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record) => {
              const { bgColor, textColor } = getFormatStyle(record.format);
              
              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${bgColor} ${textColor}`}>
                      {record.format}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{record.filename}</p>
                      <p className="text-xs text-gray-500">{formatDate(record.timestamp)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(record)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded"
                    title="다운로드"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// 내보내기 기록 추가 함수 (외부에서 사용)
export const addExportRecord = (
  projectId: string,
  format: ExportFormat,
  filename: string,
  content: string,
  mimeType: string
) => {
  try {
    const historyKey = `export_history_${projectId}`;
    const storedHistory = localStorage.getItem(historyKey);
    let history: ExportRecord[] = [];
    
    if (storedHistory) {
      history = JSON.parse(storedHistory);
    }
    
    const newRecord: ExportRecord = {
      id: Date.now().toString(),
      timestamp: new Date(),
      format,
      filename,
      content,
      mimeType
    };
    
    const updatedHistory = [newRecord, ...history].slice(0, 10); // 최대 10개 기록 유지
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
    
    return newRecord;
  } catch (err) {
    console.error('내보내기 기록을 저장하는 중 오류가 발생했습니다:', err);
    return null;
  }
};

export default ExportHistory;