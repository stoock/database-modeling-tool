import { describe, it, expect } from 'vitest';
import { AxiosError } from 'axios';
import {
  ErrorType,
  parseAxiosError,
  parseError,
  formatValidationErrors,
  isRetryableError,
  getUserFriendlyMessage,
} from './errorHandler';
import type { ApiError } from '@/types';

describe('errorHandler', () => {
  describe('parseAxiosError', () => {
    it('서버 응답이 있는 경우 에러를 파싱해야 함', () => {
      const error = {
        response: {
          status: 404,
          data: {
            error: {
              message: '프로젝트를 찾을 수 없습니다',
              code: 'NOT_FOUND',
            },
            timestamp: '2024-01-01T00:00:00Z',
          },
        },
      } as AxiosError<ApiError>;

      const result = parseAxiosError(error);

      expect(result.type).toBe(ErrorType.NOT_FOUND);
      expect(result.title).toBe('리소스 없음');
      expect(result.message).toBe('프로젝트를 찾을 수 없습니다');
      expect(result.statusCode).toBe(404);
    });

    it('네트워크 에러를 처리해야 함', () => {
      const error = {
        request: {},
        message: 'Network Error',
      } as AxiosError;

      const result = parseAxiosError(error);

      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.title).toBe('네트워크 오류');
      expect(result.message).toContain('서버에 연결할 수 없습니다');
    });

    it('검증 에러를 처리해야 함', () => {
      const error = {
        response: {
          status: 400,
          data: {
            error: {
              message: '잘못된 요청입니다',
              code: 'VALIDATION_ERROR',
              details: {
                name: ['이름은 필수입니다'],
                email: ['유효한 이메일을 입력하세요'],
              },
            },
            timestamp: '2024-01-01T00:00:00Z',
          },
        },
      } as AxiosError<ApiError>;

      const result = parseAxiosError(error);

      expect(result.type).toBe(ErrorType.VALIDATION);
      expect(result.details).toBeDefined();
      expect(result.details?.name).toEqual(['이름은 필수입니다']);
    });
  });

  describe('parseError', () => {
    it('Axios 에러를 처리해야 함', () => {
      const error = {
        response: {
          status: 500,
          data: {
            error: {
              message: '서버 오류',
              code: 'SERVER_ERROR',
            },
            timestamp: '2024-01-01T00:00:00Z',
          },
        },
      } as AxiosError<ApiError>;

      const result = parseError(error);

      expect(result.type).toBe(ErrorType.SERVER);
    });

    it('일반 Error 객체를 처리해야 함', () => {
      const error = new Error('테스트 에러');

      const result = parseError(error);

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe('테스트 에러');
    });

    it('문자열 에러를 처리해야 함', () => {
      const error = '문자열 에러 메시지';

      const result = parseError(error);

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe('문자열 에러 메시지');
    });
  });

  describe('formatValidationErrors', () => {
    it('검증 에러를 포맷팅해야 함', () => {
      const details = {
        name: ['이름은 필수입니다', '이름은 100자 이하여야 합니다'],
        email: ['유효한 이메일을 입력하세요'],
      };

      const result = formatValidationErrors(details);

      expect(result).toContain('name: 이름은 필수입니다, 이름은 100자 이하여야 합니다');
      expect(result).toContain('email: 유효한 이메일을 입력하세요');
    });

    it('details가 없으면 빈 문자열을 반환해야 함', () => {
      const result = formatValidationErrors(undefined);

      expect(result).toBe('');
    });
  });

  describe('isRetryableError', () => {
    it('재시도 가능한 에러를 식별해야 함', () => {
      expect(
        isRetryableError({ type: ErrorType.NETWORK, title: '', message: '' })
      ).toBe(true);
      expect(
        isRetryableError({ type: ErrorType.TIMEOUT, title: '', message: '' })
      ).toBe(true);
      expect(
        isRetryableError({ type: ErrorType.SERVER, title: '', message: '' })
      ).toBe(true);
    });

    it('재시도 불가능한 에러를 식별해야 함', () => {
      expect(
        isRetryableError({ type: ErrorType.VALIDATION, title: '', message: '' })
      ).toBe(false);
      expect(
        isRetryableError({ type: ErrorType.NOT_FOUND, title: '', message: '' })
      ).toBe(false);
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('기본 메시지를 반환해야 함', () => {
      const errorInfo = {
        type: ErrorType.SERVER,
        title: '서버 오류',
        message: '서버에서 오류가 발생했습니다',
      };

      const result = getUserFriendlyMessage(errorInfo);

      expect(result).toBe('서버에서 오류가 발생했습니다');
    });

    it('검증 에러 상세 정보를 포함해야 함', () => {
      const errorInfo = {
        type: ErrorType.VALIDATION,
        title: '검증 실패',
        message: '입력 데이터가 유효하지 않습니다',
        details: {
          name: ['이름은 필수입니다'],
        },
      };

      const result = getUserFriendlyMessage(errorInfo);

      expect(result).toContain('입력 데이터가 유효하지 않습니다');
      expect(result).toContain('name: 이름은 필수입니다');
    });

    it('재시도 가능한 에러에 안내를 추가해야 함', () => {
      const errorInfo = {
        type: ErrorType.NETWORK,
        title: '네트워크 오류',
        message: '서버에 연결할 수 없습니다',
      };

      const result = getUserFriendlyMessage(errorInfo);

      expect(result).toContain('잠시 후 다시 시도해주세요');
    });
  });
});
