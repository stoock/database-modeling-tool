/**
 * API 관련 타입 정의
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  timestamp: string;
}

export interface ValidationResult {
  valid: boolean;
  name: string;
  type: string;
  errors: ValidationError[];
  suggestion?: string;
}

export interface ValidationError {
  code: string;
  message: string;
  detail?: string;
}

export interface ExportRequest {
  format: ExportFormat;
  includeValidation?: boolean;
}

export type ExportFormat = 'SQL' | 'MARKDOWN' | 'HTML' | 'JSON' | 'CSV';

export interface ExportResponse {
  format: ExportFormat;
  content: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  tableCount: number;
  indexCount: number;
}
