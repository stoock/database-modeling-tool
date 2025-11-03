/**
 * 프로젝트 관련 API 서비스
 */

import api from './api';
import type {
  Project,
  ProjectSummary,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../types/project';
import type { ApiResponse } from '../types/api';

export const projectService = {
  /**
   * 프로젝트 목록 조회
   */
  getAll: async (): Promise<ProjectSummary[]> => {
    const response = await api.get<ApiResponse<ProjectSummary[]>>('/projects');
    return response.data;
  },

  /**
   * 프로젝트 상세 조회
   */
  getById: async (id: string): Promise<Project> => {
    const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data;
  },

  /**
   * 프로젝트 생성
   */
  create: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await api.post<ApiResponse<Project>>('/projects', data);
    return response.data;
  },

  /**
   * 프로젝트 수정
   */
  update: async (id: string, data: UpdateProjectRequest): Promise<Project> => {
    const response = await api.put<ApiResponse<Project>>(`/projects/${id}`, data);
    return response.data;
  },

  /**
   * 프로젝트 삭제
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};
