import type { ExportFormat } from '../types';

export interface ExportRecord {
  id: string;
  projectId: string;
  format: ExportFormat;
  filename: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

/**
 * 내보내기 기록 추가 함수
 */
export const addExportRecord = (
  projectId: string,
  format: ExportFormat,
  filename: string,
  success: boolean = true,
  errorMessage?: string
) => {
  const record: ExportRecord = {
    id: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    projectId,
    format,
    filename,
    timestamp: new Date(),
    success,
    errorMessage,
  };

  // 기존 기록 가져오기
  const existingHistory = localStorage.getItem(`export_history_${projectId}`);
  const history: ExportRecord[] = existingHistory 
    ? JSON.parse(existingHistory) 
    : [];

  // 새 기록 추가 (최대 50개까지만 유지)
  history.unshift(record);
  if (history.length > 50) {
    history.splice(50);
  }

  // 저장
  localStorage.setItem(`export_history_${projectId}`, JSON.stringify(history));
};

/**
 * 내보내기 기록 가져오기 함수
 */
export const getExportHistory = (projectId: string): ExportRecord[] => {
  const storedHistory = localStorage.getItem(`export_history_${projectId}`);
  
  if (storedHistory) {
    const parsedHistory = JSON.parse(storedHistory);
    // 날짜 문자열을 Date 객체로 변환
    return parsedHistory.map((record: { timestamp: string; [key: string]: unknown }) => ({
      ...record,
      timestamp: new Date(record.timestamp)
    }));
  }
  
  return [];
};

/**
 * 내보내기 기록 삭제 함수
 */
export const clearExportHistory = (projectId: string) => {
  localStorage.removeItem(`export_history_${projectId}`);
};