import axios, { AxiosError } from 'axios';
import { useToastStore } from '@/stores/toastStore';
import { parseAxiosError, logError, getUserFriendlyMessage } from '@/lib/errorHandler';
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
  ReorderColumnsRequest,
  ValidationResult,
  ExportOptions,
  ExportResult,
  ApiError,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30초 타임아웃
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 요청 전 처리 (예: 인증 토큰 추가)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 및 토스트 표시
apiClient.interceptors.response.use(
  (response) => {
    // 백엔드 응답이 { success: true, data: ... } 형태인 경우 data 필드 추출
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error: AxiosError<ApiError>) => {
    const toastStore = useToastStore.getState();
    
    // 에러 파싱
    const errorInfo = parseAxiosError(error);
    
    // 에러 로깅 (개발 환경)
    logError(errorInfo);
    
    // 사용자 친화적 메시지 생성
    const message = getUserFriendlyMessage(errorInfo);
    
    // 토스트 메시지 표시
    toastStore.error(errorInfo.title, message);
    
    return Promise.reject(error);
  }
);

// ============================================
// 프로젝트 API
// ============================================

/**
 * 프로젝트 목록 조회
 */
export const getProjects = async (): Promise<Project[]> => {
  const response = await apiClient.get<Project[]>('/projects');
  return response.data;
};

/**
 * 프로젝트 단건 조회
 */
export const getProject = async (projectId: string): Promise<Project> => {
  const response = await apiClient.get<Project>(`/projects/${projectId}`);
  return response.data;
};

/**
 * 프로젝트 생성
 */
export const createProject = async (data: CreateProjectRequest): Promise<Project> => {
  const response = await apiClient.post<Project>('/projects', data);
  const toastStore = useToastStore.getState();
  toastStore.success('프로젝트 생성 완료', `"${data.name}" 프로젝트가 생성되었습니다`);
  return response.data;
};

/**
 * 프로젝트 수정
 */
export const updateProject = async (
  projectId: string,
  data: UpdateProjectRequest
): Promise<Project> => {
  const response = await apiClient.put<Project>(`/projects/${projectId}`, data);
  const toastStore = useToastStore.getState();
  toastStore.success('프로젝트 수정 완료', '프로젝트 정보가 수정되었습니다');
  return response.data;
};

/**
 * 프로젝트 삭제
 */
export const deleteProject = async (projectId: string): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}`);
  const toastStore = useToastStore.getState();
  toastStore.success('프로젝트 삭제 완료', '프로젝트가 삭제되었습니다');
};

// ============================================
// 테이블 API
// ============================================

/**
 * 프로젝트의 테이블 목록 조회
 */
export const getTables = async (projectId: string): Promise<Table[]> => {
  const response = await apiClient.get<Table[]>(`/projects/${projectId}/tables`);
  return response.data;
};

/**
 * 테이블 단건 조회
 */
export const getTable = async (tableId: string): Promise<Table> => {
  const response = await apiClient.get<Table>(`/tables/${tableId}`);
  return response.data;
};

/**
 * 테이블 생성
 */
export const createTable = async (data: CreateTableRequest): Promise<Table> => {
  const response = await apiClient.post<Table>(`/projects/${data.projectId}/tables`, data);
  const toastStore = useToastStore.getState();
  toastStore.success('테이블 생성 완료', `"${data.name}" 테이블이 생성되었습니다`);
  return response.data;
};

/**
 * 테이블 수정
 */
export const updateTable = async (
  tableId: string,
  data: UpdateTableRequest
): Promise<Table> => {
  const response = await apiClient.put<Table>(`/tables/${tableId}`, data);
  const toastStore = useToastStore.getState();
  toastStore.success('테이블 수정 완료', '테이블 정보가 수정되었습니다');
  return response.data;
};

/**
 * 테이블 삭제
 */
export const deleteTable = async (tableId: string): Promise<void> => {
  await apiClient.delete(`/tables/${tableId}`);
  const toastStore = useToastStore.getState();
  toastStore.success('테이블 삭제 완료', '테이블이 삭제되었습니다');
};

// ============================================
// 컬럼 API
// ============================================

/**
 * 테이블의 컬럼 목록 조회
 */
export const getColumns = async (tableId: string): Promise<Column[]> => {
  const response = await apiClient.get<Column[]>(`/tables/${tableId}/columns`);
  return response.data;
};

/**
 * 컬럼 단건 조회
 */
export const getColumn = async (columnId: string): Promise<Column> => {
  const response = await apiClient.get<Column>(`/columns/${columnId}`);
  return response.data;
};

/**
 * 컬럼 생성
 */
export const createColumn = async (data: CreateColumnRequest): Promise<Column> => {
  const response = await apiClient.post<Column>(`/tables/${data.tableId}/columns`, data);
  const toastStore = useToastStore.getState();
  toastStore.success('컬럼 생성 완료', `"${data.name}" 컬럼이 생성되었습니다`);
  return response.data;
};

/**
 * 컬럼 수정
 */
export const updateColumn = async (
  columnId: string,
  data: UpdateColumnRequest
): Promise<Column> => {
  const response = await apiClient.put<Column>(`/columns/${columnId}`, data);
  const toastStore = useToastStore.getState();
  toastStore.success('컬럼 수정 완료', '컬럼 정보가 수정되었습니다');
  return response.data;
};

/**
 * 컬럼 삭제
 */
export const deleteColumn = async (columnId: string): Promise<void> => {
  await apiClient.delete(`/columns/${columnId}`);
  const toastStore = useToastStore.getState();
  toastStore.success('컬럼 삭제 완료', '컬럼이 삭제되었습니다');
};

/**
 * 컬럼 순서 변경
 */
export const reorderColumns = async (
  tableId: string,
  data: ReorderColumnsRequest
): Promise<Column[]> => {
  const response = await apiClient.put<Column[]>(
    `/tables/${tableId}/columns/reorder`,
    data
  );
  const toastStore = useToastStore.getState();
  toastStore.success('컬럼 순서 변경 완료', '컬럼 순서가 변경되었습니다');
  return response.data;
};

// ============================================
// 인덱스 API
// ============================================

/**
 * 테이블의 인덱스 목록 조회
 */
export const getIndexes = async (tableId: string): Promise<Index[]> => {
  const response = await apiClient.get<Index[]>(`/tables/${tableId}/indexes`);
  return response.data;
};

/**
 * 인덱스 단건 조회
 */
export const getIndex = async (indexId: string): Promise<Index> => {
  const response = await apiClient.get<Index>(`/indexes/${indexId}`);
  return response.data;
};

/**
 * 인덱스 생성
 */
export const createIndex = async (data: CreateIndexRequest): Promise<Index> => {
  const response = await apiClient.post<Index>(`/tables/${data.tableId}/indexes`, data);
  const toastStore = useToastStore.getState();
  toastStore.success('인덱스 생성 완료', `"${data.name}" 인덱스가 생성되었습니다`);
  return response.data;
};

/**
 * 인덱스 삭제
 */
export const deleteIndex = async (indexId: string): Promise<void> => {
  await apiClient.delete(`/indexes/${indexId}`);
  const toastStore = useToastStore.getState();
  toastStore.success('인덱스 삭제 완료', '인덱스가 삭제되었습니다');
};

// ============================================
// 검증 API
// ============================================

/**
 * 프로젝트 전체 검증
 */
export const validateProject = async (projectId: string): Promise<ValidationResult> => {
  const response = await apiClient.post<ValidationResult>(
    `/projects/${projectId}/validate`
  );
  return response.data;
};

/**
 * 테이블 명명 규칙 검증
 */
export const validateTableName = async (
  projectId: string,
  tableName: string
): Promise<ValidationResult> => {
  const response = await apiClient.post<ValidationResult>(
    `/projects/${projectId}/validate/table-name`,
    { name: tableName }
  );
  return response.data;
};

/**
 * 컬럼 명명 규칙 검증
 */
export const validateColumnName = async (
  projectId: string,
  tableName: string,
  columnName: string,
  isPrimaryKey: boolean = false
): Promise<ValidationResult> => {
  const response = await apiClient.post<ValidationResult>(
    `/projects/${projectId}/validate/column-name`,
    { tableName, columnName, isPrimaryKey }
  );
  return response.data;
};

/**
 * 인덱스 명명 규칙 검증
 */
export const validateIndexName = async (
  projectId: string,
  indexName: string,
  indexType: 'CLUSTERED' | 'NONCLUSTERED'
): Promise<ValidationResult> => {
  const response = await apiClient.post<ValidationResult>(
    `/projects/${projectId}/validate/index-name`,
    { name: indexName, type: indexType }
  );
  return response.data;
};

// ============================================
// 내보내기 API
// ============================================

/**
 * SQL 스크립트 생성
 */
export const exportToSql = async (
  projectId: string,
  options: ExportOptions
): Promise<ExportResult> => {
  const response = await apiClient.post<ExportResult>(
    `/projects/${projectId}/export/sql`,
    options
  );
  const toastStore = useToastStore.getState();
  toastStore.success('SQL 생성 완료', 'SQL 스크립트가 생성되었습니다');
  return response.data;
};

/**
 * JSON 형식으로 내보내기
 */
export const exportToJson = async (projectId: string): Promise<ExportResult> => {
  const response = await apiClient.post<ExportResult>(
    `/projects/${projectId}/export/json`
  );
  const toastStore = useToastStore.getState();
  toastStore.success('JSON 생성 완료', 'JSON 파일이 생성되었습니다');
  return response.data;
};

/**
 * Markdown 형식으로 내보내기
 */
export const exportToMarkdown = async (projectId: string): Promise<ExportResult> => {
  const response = await apiClient.post<ExportResult>(
    `/projects/${projectId}/export/markdown`
  );
  const toastStore = useToastStore.getState();
  toastStore.success('Markdown 생성 완료', 'Markdown 문서가 생성되었습니다');
  return response.data;
};

// ============================================
// 유틸리티 함수
// ============================================

/**
 * API 클라이언트 기본 내보내기
 */
export default apiClient;
