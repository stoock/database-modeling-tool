/**
 * 테이블 관련 API 서비스
 */

import api from './api';
import type {
  Table,
  TableSummary,
  CreateTableRequest,
  UpdateTableRequest,
} from '../types/table';
import type { ApiResponse } from '../types/api';

export const tableService = {
  /**
   * 프로젝트의 테이블 목록 조회
   */
  getByProjectId: async (projectId: string): Promise<TableSummary[]> => {
    const response = await api.get<ApiResponse<TableSummary[]>>(
      `/projects/${projectId}/tables`
    );
    return response.data;
  },

  /**
   * 테이블 상세 조회
   */
  getById: async (id: string): Promise<Table> => {
    const response = await api.get<ApiResponse<Table>>(`/tables/${id}`);
    return response.data;
  },

  /**
   * 테이블 생성
   */
  create: async (projectId: string, data: CreateTableRequest): Promise<Table> => {
    const response = await api.post<ApiResponse<Table>>(
      `/projects/${projectId}/tables`,
      data
    );
    return response.data;
  },

  /**
   * 테이블 수정
   */
  update: async (id: string, data: UpdateTableRequest): Promise<Table> => {
    const response = await api.put<ApiResponse<Table>>(`/tables/${id}`, data);
    return response.data;
  },

  /**
   * 테이블 삭제
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/tables/${id}`);
  },
};
