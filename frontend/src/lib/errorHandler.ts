import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

/**
 * 에러 타입 정의
 */
export const ErrorType = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  SERVER: 'SERVER',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

/**
 * 에러 정보 인터페이스
 */
export interface ErrorInfo {
  type: ErrorType;
  title: string;
  message: string;
  statusCode?: number;
  details?: Record<string, string[]>;
  originalError?: unknown;
}

/**
 * HTTP 상태 코드에 따른 에러 메시지 매핑
 */
const STATUS_CODE_MESSAGES: Record<number, { title: string; message: string; type: ErrorType }> = {
  400: {
    title: '잘못된 요청',
    message: '요청 데이터를 확인해주세요',
    type: ErrorType.VALIDATION,
  },
  401: {
    title: '인증 필요',
    message: '로그인이 필요합니다',
    type: ErrorType.UNAUTHORIZED,
  },
  403: {
    title: '접근 거부',
    message: '이 작업을 수행할 권한이 없습니다',
    type: ErrorType.FORBIDDEN,
  },
  404: {
    title: '리소스 없음',
    message: '요청한 리소스를 찾을 수 없습니다',
    type: ErrorType.NOT_FOUND,
  },
  409: {
    title: '중복 데이터',
    message: '이미 존재하는 데이터입니다',
    type: ErrorType.CONFLICT,
  },
  422: {
    title: '검증 실패',
    message: '입력 데이터가 유효하지 않습니다',
    type: ErrorType.VALIDATION,
  },
  500: {
    title: '서버 오류',
    message: '서버에서 오류가 발생했습니다',
    type: ErrorType.SERVER,
  },
  502: {
    title: '게이트웨이 오류',
    message: '서버 연결에 문제가 있습니다',
    type: ErrorType.SERVER,
  },
  503: {
    title: '서비스 이용 불가',
    message: '데이터베이스 연결에 실패했습니다. PostgreSQL이 실행 중인지 확인해주세요.',
    type: ErrorType.SERVER,
  },
  504: {
    title: '타임아웃',
    message: '요청 시간이 초과되었습니다',
    type: ErrorType.TIMEOUT,
  },
};

/**
 * Axios 에러를 ErrorInfo로 변환
 */
export function parseAxiosError(error: AxiosError<ApiError>): ErrorInfo {
  // 응답이 있는 경우 (서버에서 응답을 받음)
  if (error.response) {
    const status = error.response.status;
    const errorData = error.response.data;
    
    // 서버에서 제공한 에러 메시지 사용
    if (errorData?.error) {
      const statusInfo = STATUS_CODE_MESSAGES[status] || {
        title: '오류',
        message: '알 수 없는 오류가 발생했습니다',
        type: ErrorType.UNKNOWN,
      };
      
      return {
        type: statusInfo.type,
        title: statusInfo.title,
        message: errorData.error.message || statusInfo.message,
        statusCode: status,
        details: errorData.error.details,
        originalError: error,
      };
    }
    
    // 상태 코드 기반 메시지
    const statusInfo = STATUS_CODE_MESSAGES[status];
    if (statusInfo) {
      return {
        type: statusInfo.type,
        title: statusInfo.title,
        message: statusInfo.message,
        statusCode: status,
        originalError: error,
      };
    }
    
    // 알 수 없는 상태 코드
    return {
      type: ErrorType.UNKNOWN,
      title: '오류',
      message: `오류가 발생했습니다 (${status})`,
      statusCode: status,
      originalError: error,
    };
  }
  
  // 요청은 보냈지만 응답이 없는 경우 (네트워크 오류)
  if (error.request) {
    return {
      type: ErrorType.NETWORK,
      title: '서버 연결 실패',
      message: '백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요. (http://localhost:8080)',
      originalError: error,
    };
  }
  
  // 요청 설정 중 오류 발생
  return {
    type: ErrorType.UNKNOWN,
    title: '요청 오류',
    message: error.message || '요청 처리 중 오류가 발생했습니다',
    originalError: error,
  };
}

/**
 * 일반 에러를 ErrorInfo로 변환
 */
export function parseError(error: unknown): ErrorInfo {
  // Axios 에러인 경우
  if (error instanceof AxiosError) {
    return parseAxiosError(error);
  }
  
  // Error 객체인 경우
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      title: '오류',
      message: error.message || '알 수 없는 오류가 발생했습니다',
      originalError: error,
    };
  }
  
  // 문자열인 경우
  if (typeof error === 'string') {
    return {
      type: ErrorType.UNKNOWN,
      title: '오류',
      message: error,
      originalError: error,
    };
  }
  
  // 알 수 없는 타입
  return {
    type: ErrorType.UNKNOWN,
    title: '오류',
    message: '알 수 없는 오류가 발생했습니다',
    originalError: error,
  };
}

/**
 * 에러 로깅 (개발 환경에서만)
 */
export function logError(errorInfo: ErrorInfo): void {
  if (import.meta.env.DEV) {
    console.group(`🔴 ${errorInfo.title}`);
    console.error('Message:', errorInfo.message);
    console.error('Type:', errorInfo.type);
    if (errorInfo.statusCode) {
      console.error('Status Code:', errorInfo.statusCode);
    }
    if (errorInfo.details) {
      console.error('Details:', errorInfo.details);
    }
    if (errorInfo.originalError) {
      console.error('Original Error:', errorInfo.originalError);
    }
    console.groupEnd();
  }
}

/**
 * 검증 에러 메시지 포맷팅
 */
export function formatValidationErrors(details?: Record<string, string | string[]>): string {
  if (!details) return '';
  
  const messages: string[] = [];
  for (const [field, errors] of Object.entries(details)) {
    // errors가 배열이면 join, 문자열이면 그대로 사용
    const errorMessage = Array.isArray(errors) ? errors.join(', ') : errors;
    messages.push(`${field}: ${errorMessage}`);
  }
  
  return messages.join('\n');
}

/**
 * 에러 재시도 가능 여부 확인
 */
export function isRetryableError(errorInfo: ErrorInfo): boolean {
  const retryableTypes: ErrorType[] = [
    ErrorType.NETWORK,
    ErrorType.TIMEOUT,
    ErrorType.SERVER,
  ];
  return retryableTypes.includes(errorInfo.type);
}

/**
 * 사용자 친화적 에러 메시지 생성
 */
export function getUserFriendlyMessage(errorInfo: ErrorInfo): string {
  let message = errorInfo.message;
  
  // 검증 에러의 경우 상세 정보 추가
  if (errorInfo.details) {
    const validationMessages = formatValidationErrors(errorInfo.details);
    if (validationMessages) {
      message += '\n\n' + validationMessages;
    }
  }
  
  // 재시도 가능한 에러의 경우 안내 추가
  if (isRetryableError(errorInfo)) {
    message += '\n\n잠시 후 다시 시도해주세요.';
  }
  
  return message;
}
