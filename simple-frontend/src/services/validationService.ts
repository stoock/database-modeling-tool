/**
 * 네이밍 규칙 검증 관련 API 서비스
 */

import api from './api';
import type { ValidationResult } from '../types/api';

export const validationService = {
  /**
   * 이름 검증
   */
  validateName: async (
    projectId: string,
    name: string,
    type: 'TABLE' | 'COLUMN' | 'INDEX'
  ): Promise<ValidationResult> => {
    const response = await api.post<{ data: ValidationResult }>(
      `/projects/${projectId}/validation`,
      { name, type }
    );
    return response.data;
  },

  /**
   * 프로젝트 전체 검증
   */
  validateProject: async (projectId: string): Promise<ValidationResult[]> => {
    const response = await api.post<{ data: ValidationResult[] }>(
      `/projects/${projectId}/validation/all`
    );
    return response.data;
  },
};
