import { describe, it, expect } from 'vitest'
import { AxiosError } from 'axios'
import {
  ErrorType,
  parseAxiosError,
  parseError,
  formatValidationErrors,
  isRetryableError,
  getUserFriendlyMessage,
} from './errorHandler'

describe('errorHandler', () => {
  describe('parseAxiosError', () => {
    it('서버 응답이 있는 경우 에러 파싱', () => {
      const axiosError = {
        response: {
          status: 400,
          data: {
            error: {
              message: '잘못된 요청입니다',
              details: { name: ['필수 항목입니다'] },
            },
          },
        },
        request: {},
        message: 'Request failed',
      } as AxiosError<any>

      const result = parseAxiosError(axiosError)

      expect(result.type).toBe(ErrorType.VALIDATION)
      expect(result.title).toBe('잘못된 요청')
      expect(result.message).toBe('잘못된 요청입니다')
      expect(result.statusCode).toBe(400)
      expect(result.details).toEqual({ name: ['필수 항목입니다'] })
    })

    it('404 에러 처리', () => {
      const axiosError = {
        response: {
          status: 404,
          data: {},
        },
        request: {},
        message: 'Not found',
      } as AxiosError<any>

      const result = parseAxiosError(axiosError)

      expect(result.type).toBe(ErrorType.NOT_FOUND)
      expect(result.title).toBe('리소스 없음')
      expect(result.statusCode).toBe(404)
    })

    it('네트워크 에러 처리', () => {
      const axiosError = {
        request: {},
        message: 'Network Error',
      } as AxiosError<any>

      const result = parseAxiosError(axiosError)

      expect(result.type).toBe(ErrorType.NETWORK)
      expect(result.title).toBe('네트워크 오류')
    })

    it('요청 설정 에러 처리', () => {
      const axiosError = {
        message: 'Invalid config',
      } as AxiosError<any>

      const result = parseAxiosError(axiosError)

      expect(result.type).toBe(ErrorType.UNKNOWN)
      expect(result.title).toBe('요청 오류')
    })
  })

  describe('parseError', () => {
    it('Axios 에러 처리', () => {
      const axiosError = new AxiosError('Server error')
      axiosError.response = {
        status: 500,
        data: {},
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any,
      }

      const result = parseError(axiosError)

      expect(result.type).toBe(ErrorType.SERVER)
    })

    it('일반 Error 객체 처리', () => {
      const error = new Error('테스트 에러')

      const result = parseError(error)

      expect(result.type).toBe(ErrorType.UNKNOWN)
      expect(result.message).toBe('테스트 에러')
    })

    it('문자열 에러 처리', () => {
      const result = parseError('에러 메시지')

      expect(result.type).toBe(ErrorType.UNKNOWN)
      expect(result.message).toBe('에러 메시지')
    })

    it('알 수 없는 타입 에러 처리', () => {
      const result = parseError({ unknown: 'error' })

      expect(result.type).toBe(ErrorType.UNKNOWN)
      expect(result.message).toBe('알 수 없는 오류가 발생했습니다')
    })
  })

  describe('formatValidationErrors', () => {
    it('검증 에러 포맷팅', () => {
      const details = {
        name: ['필수 항목입니다', '최소 3자 이상이어야 합니다'],
        email: ['유효한 이메일 주소가 아닙니다'],
      }

      const result = formatValidationErrors(details)

      expect(result).toContain('name: 필수 항목입니다, 최소 3자 이상이어야 합니다')
      expect(result).toContain('email: 유효한 이메일 주소가 아닙니다')
    })

    it('details가 없으면 빈 문자열 반환', () => {
      const result = formatValidationErrors(undefined)
      expect(result).toBe('')
    })
  })

  describe('isRetryableError', () => {
    it('네트워크 에러는 재시도 가능', () => {
      const errorInfo = {
        type: ErrorType.NETWORK,
        title: '네트워크 오류',
        message: '연결 실패',
      }

      expect(isRetryableError(errorInfo)).toBe(true)
    })

    it('타임아웃 에러는 재시도 가능', () => {
      const errorInfo = {
        type: ErrorType.TIMEOUT,
        title: '타임아웃',
        message: '시간 초과',
      }

      expect(isRetryableError(errorInfo)).toBe(true)
    })

    it('검증 에러는 재시도 불가', () => {
      const errorInfo = {
        type: ErrorType.VALIDATION,
        title: '검증 실패',
        message: '잘못된 입력',
      }

      expect(isRetryableError(errorInfo)).toBe(false)
    })
  })

  describe('getUserFriendlyMessage', () => {
    it('기본 메시지 반환', () => {
      const errorInfo = {
        type: ErrorType.UNKNOWN,
        title: '오류',
        message: '테스트 메시지',
      }

      const result = getUserFriendlyMessage(errorInfo)
      expect(result).toBe('테스트 메시지')
    })

    it('검증 에러 상세 정보 포함', () => {
      const errorInfo = {
        type: ErrorType.VALIDATION,
        title: '검증 실패',
        message: '입력 오류',
        details: {
          name: ['필수 항목입니다'],
        },
      }

      const result = getUserFriendlyMessage(errorInfo)
      expect(result).toContain('입력 오류')
      expect(result).toContain('name: 필수 항목입니다')
    })

    it('재시도 가능한 에러는 안내 메시지 추가', () => {
      const errorInfo = {
        type: ErrorType.NETWORK,
        title: '네트워크 오류',
        message: '연결 실패',
      }

      const result = getUserFriendlyMessage(errorInfo)
      expect(result).toContain('잠시 후 다시 시도해주세요')
    })
  })
})
