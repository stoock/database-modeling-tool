/**
 * 컬럼 관련 API 서비스
 */

import api from './api';
import type { Column, CreateColumnRequest, UpdateColumnRequest } from '../types/column';
import type { ApiResponse } from '../types/api';

export const columnService = {
  /**
   * 테이블의 컬럼 목록 조회
   */
  getByTableId: async (tableId: string): Promise<Column[]> => {
    const response = await api.get<ApiResponse<Column[]>>(`/tables/${tableId}/columns`);
    return response.data;
  },

  /**
   * 컬럼 생성
   */
  create: async (tableId: string, data: CreateColumnRequest): Promise<Column> => {
    const response = await api.post<ApiResponse<Column>>(
      `/tables/${tableId}/columns`,
      data
    );
    return response.data;
  },

  /**
   * 컬럼 수정
   */
  update: async (id: string, data: UpdateColumnRequest): Promise<Column> => {
    const response = await api.put<ApiResponse<Column>>(`/columns/${id}`, data);
    return response.data;
  },

  /**
   * 컬럼 삭제
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/columns/${id}`);
  },
};
