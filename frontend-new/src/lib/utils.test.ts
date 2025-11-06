import { describe, it, expect } from 'vitest'
import {
  cn,
  formatDate,
  getErrorMessage,
  truncate,
  capitalize,
  toPascalCase,
  toSnakeCase,
  reorder,
  groupBy,
  clamp,
  omit,
  pick,
} from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('클래스명 병합', () => {
      const result = cn('text-red-500', 'bg-blue-500')
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
    })
  })

  describe('formatDate', () => {
    it('날짜 포맷팅', () => {
      const result = formatDate('2024-01-15T10:30:00')
      expect(result).toContain('2024')
      expect(result).toContain('01')
      expect(result).toContain('15')
    })
  })

  describe('getErrorMessage', () => {
    it('Error 객체에서 메시지 추출', () => {
      const error = new Error('테스트 에러')
      expect(getErrorMessage(error)).toBe('테스트 에러')
    })

    it('문자열 에러 처리', () => {
      expect(getErrorMessage('에러 메시지')).toBe('에러 메시지')
    })

    it('알 수 없는 에러 처리', () => {
      expect(getErrorMessage(null)).toBe('알 수 없는 오류가 발생했습니다')
    })
  })

  describe('truncate', () => {
    it('긴 문자열 자르기', () => {
      const result = truncate('This is a long text', 10)
      expect(result).toBe('This is a ...')
    })

    it('짧은 문자열은 그대로', () => {
      const result = truncate('Short', 10)
      expect(result).toBe('Short')
    })
  })

  describe('capitalize', () => {
    it('첫 글자 대문자', () => {
      expect(capitalize('hello')).toBe('Hello')
    })
  })

  describe('toPascalCase', () => {
    it('snake_case를 PascalCase로', () => {
      expect(toPascalCase('user_name')).toBe('UserName')
    })

    it('kebab-case를 PascalCase로', () => {
      expect(toPascalCase('user-name')).toBe('UserName')
    })
  })

  describe('toSnakeCase', () => {
    it('PascalCase를 snake_case로', () => {
      expect(toSnakeCase('UserName')).toBe('user_name')
    })

    it('camelCase를 snake_case로', () => {
      expect(toSnakeCase('userName')).toBe('user_name')
    })
  })

  describe('reorder', () => {
    it('배열 요소 순서 변경', () => {
      const list = ['a', 'b', 'c', 'd']
      const result = reorder(list, 1, 3)
      expect(result).toEqual(['a', 'c', 'd', 'b'])
    })
  })

  describe('groupBy', () => {
    it('배열을 키로 그룹화', () => {
      const items = [
        { type: 'A', value: 1 },
        { type: 'B', value: 2 },
        { type: 'A', value: 3 },
      ]
      const result = groupBy(items, 'type')
      expect(result.A).toHaveLength(2)
      expect(result.B).toHaveLength(1)
    })
  })

  describe('clamp', () => {
    it('값을 범위 내로 제한', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })

  describe('omit', () => {
    it('객체에서 키 제거', () => {
      const obj = { a: 1, b: 2, c: 3 }
      const result = omit(obj, ['b'])
      expect(result).toEqual({ a: 1, c: 3 })
    })
  })

  describe('pick', () => {
    it('객체에서 키 선택', () => {
      const obj = { a: 1, b: 2, c: 3 }
      const result = pick(obj, ['a', 'c'])
      expect(result).toEqual({ a: 1, c: 3 })
    })
  })
})
