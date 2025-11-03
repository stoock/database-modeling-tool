/**
 * 스키마 내보내기 관련 API 서비스
 */

import api from './api';
import type { ExportOptions } from '../types/api';

export const exportService = {
  /**
   * 스키마 미리보기
   */
  preview: async (projectId: string, options: ExportOptions): Promise<string> => {
    const response = await api.post<{ data: string }>(
      `/projects/${projectId}/export/preview`,
      options
    );
    return response.data;
  },

  /**
   * 스키마 다운로드
   */
  download: async (projectId: string, options: ExportOptions): Promise<Blob> => {
    const response = await api.post(
      `/projects/${projectId}/export/download`,
      options,
      {
        responseType: 'blob',
      }
    );
    return response as unknown as Blob;
  },
};
