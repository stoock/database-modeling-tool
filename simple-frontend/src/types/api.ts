/**
 * API 응답 관련 타입 정의
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

export interface ApiError {
  error: string;
  code: string;
  details?: ValidationError[];
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

export interface ExportOptions {
  format: ExportFormat;
  includeValidation?: boolean;
}

export type ExportFormat = 'SQL' | 'MARKDOWN' | 'HTML' | 'JSON' | 'CSV';
