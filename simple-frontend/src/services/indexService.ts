/**
 * 인덱스 관련 API 서비스
 */

import api from './api';
import type { Index, CreateIndexRequest } from '../types/index';
import type { ApiResponse } from '../types/api';

export const indexService = {
  /**
   * 테이블의 인덱스 목록 조회
   */
  getByTableId: async (tableId: string): Promise<Index[]> => {
    const response = await api.get<ApiResponse<Index[]>>(`/tables/${tableId}/indexes`);
    return response.data;
  },

  /**
   * 인덱스 생성
   */
  create: async (tableId: string, data: CreateIndexRequest): Promise<Index> => {
    const response = await api.post<ApiResponse<Index>>(
      `/tables/${tableId}/indexes`,
      data
    );
    return response.data;
  },

  /**
   * 인덱스 삭제
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/indexes/${id}`);
  },
};
