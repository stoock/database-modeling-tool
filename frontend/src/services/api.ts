import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  Project,
  Table,
  Column,
  Index,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateTableRequest,
  UpdateTableRequest,
  CreateColumnRequest,
  UpdateColumnRequest,
  CreateIndexRequest,
  UpdateIndexRequest,
  ValidationResult,
  ExportRequest,
  ExportResult,
  ApiResponse,
  ApiError,
} from '../types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터
    this.client.interceptors.request.use(
      (config) => {
        // 인증 토큰이 있다면 헤더에 추가
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<any>>) => response,
      (error) => {
        if (error.response?.status === 401) {
          // 인증 오류 처리
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // 프로젝트 관련 API
  async getProjects(): Promise<Project[]> {
    const response = await this.client.get<ApiResponse<Project[]>>('/projects');
    return response.data.data;
  }

  async getProject(id: string): Promise<Project> {
    const response = await this.client.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data;
  }

  async createProject(request: CreateProjectRequest): Promise<Project> {
    const response = await this.client.post<ApiResponse<Project>>('/projects', request);
    return response.data.data;
  }

  async updateProject(id: string, request: UpdateProjectRequest): Promise<Project> {
    const response = await this.client.put<ApiResponse<Project>>(`/projects/${id}`, request);
    return response.data.data;
  }

  async deleteProject(id: string): Promise<void> {
    await this.client.delete(`/projects/${id}`);
  }

  // 테이블 관련 API
  async getTables(projectId: string): Promise<Table[]> {
    const response = await this.client.get<ApiResponse<Table[]>>(`/projects/${projectId}/tables`);
    return response.data.data;
  }

  async createTable(projectId: string, request: CreateTableRequest): Promise<Table> {
    const response = await this.client.post<ApiResponse<Table>>(`/projects/${projectId}/tables`, request);
    return response.data.data;
  }

  async updateTable(id: string, request: UpdateTableRequest): Promise<Table> {
    const response = await this.client.put<ApiResponse<Table>>(`/tables/${id}`, request);
    return response.data.data;
  }

  async deleteTable(id: string): Promise<void> {
    await this.client.delete(`/tables/${id}`);
  }

  // 컬럼 관련 API
  async createColumn(tableId: string, request: CreateColumnRequest): Promise<Column> {
    const response = await this.client.post<ApiResponse<Column>>(`/tables/${tableId}/columns`, request);
    return response.data.data;
  }

  async updateColumn(id: string, request: UpdateColumnRequest): Promise<Column> {
    const response = await this.client.put<ApiResponse<Column>>(`/columns/${id}`, request);
    return response.data.data;
  }

  async deleteColumn(id: string): Promise<void> {
    await this.client.delete(`/columns/${id}`);
  }

  // 컬럼 순서 일괄 업데이트
  async updateColumnOrder(tableId: string, updates: { columnId: string; orderIndex: number }[]): Promise<Column[]> {
    const response = await this.client.put<ApiResponse<Column[]>>(`/tables/${tableId}/columns/reorder`, { updates });
    return response.data.data;
  }

  // 인덱스 관련 API
  async createIndex(tableId: string, request: CreateIndexRequest): Promise<Index> {
    const response = await this.client.post<ApiResponse<Index>>(`/tables/${tableId}/indexes`, request);
    return response.data.data;
  }

  async updateIndex(id: string, request: UpdateIndexRequest): Promise<Index> {
    const response = await this.client.put<ApiResponse<Index>>(`/indexes/${id}`, request);
    return response.data.data;
  }

  async deleteIndex(id: string): Promise<void> {
    await this.client.delete(`/indexes/${id}`);
  }

  // 검증 관련 API
  async validateProject(projectId: string): Promise<ValidationResult> {
    const response = await this.client.post<ApiResponse<ValidationResult>>(`/projects/${projectId}/validate`);
    return response.data.data;
  }

  // 스키마 내보내기 API
  async exportSchema(projectId: string, request: ExportRequest): Promise<ExportResult> {
    try {
      const response = await this.client.post<ApiResponse<ExportResult>>(`/projects/${projectId}/export`, request);
      return response.data.data;
    } catch (error) {
      // 백엔드 API가 아직 구현되지 않은 경우 프론트엔드에서 생성
      console.warn('백엔드 내보내기 API 호출 실패, 프론트엔드에서 생성합니다.', error);
      
      // 프로젝트 정보 가져오기
      const project = await this.getProject(projectId);
      
      // SqlGenerator를 사용하여 스키마 생성
      const { SqlGenerator } = await import('./sqlGenerator');
      const result = SqlGenerator.exportSchema(
        project.tables,
        request.format,
        request.includeComments,
        request.includeIndexes,
        request.includeConstraints
      );
      
      // 파일명 생성
      let extension = '.sql';
      switch (request.format) {
        case 'JSON': extension = '.json'; break;
        case 'MARKDOWN': extension = '.md'; break;
        case 'HTML': extension = '.html'; break;
        case 'CSV': extension = '.csv'; break;
      }
      
      return {
        content: result.content,
        filename: `${project.name}_schema${extension}`,
        mimeType: result.mimeType
      };
    }
  }
}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient();

// 에러 처리 유틸리티
export const handleApiError = (error: any): ApiError => {
  if (error.response?.data?.error) {
    return error.response.data as ApiError;
  }
  
  return {
    error: error.message || '알 수 없는 오류가 발생했습니다.',
    code: 'UNKNOWN_ERROR',
  };
};

export default apiClient;