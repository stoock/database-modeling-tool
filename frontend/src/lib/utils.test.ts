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

    it('존재하지 않는 키는 무시', () => {
      const obj = { a: 1, b: 2 }
      const result = pick(obj, ['a', 'c'] as (keyof typeof obj)[])
      expect(result).toEqual({ a: 1 })
    })
  })

  describe('formatDate 추가 테스트', () => {
    it('ISO 문자열 포맷팅', () => {
      const result = formatDate('2024-12-25T15:30:00Z')
      expect(result).toMatch(/2024/)
      expect(result).toMatch(/12/)
      // 시간대 변환으로 인해 날짜가 26일이 될 수 있음
      expect(result).toMatch(/2[56]/)
    })

    it('Date 객체 포맷팅', () => {
      const date = new Date('2024-06-15T10:00:00')
      const result = formatDate(date.toISOString())
      expect(result).toMatch(/2024/)
    })
  })

  describe('toPascalCase 추가 테스트', () => {
    it('공백으로 구분된 문자열', () => {
      expect(toPascalCase('user name')).toBe('UserName')
    })

    it('이미 PascalCase인 경우', () => {
      // toPascalCase는 단어를 분리하지 않으므로 전체가 하나의 단어로 처리됨
      expect(toPascalCase('UserName')).toBe('Username')
    })

    it('여러 구분자 혼합', () => {
      expect(toPascalCase('user-name_id')).toBe('UserNameId')
    })
  })

  describe('toSnakeCase 추가 테스트', () => {
    it('공백 포함 문자열', () => {
      // toSnakeCase는 공백을 처리하지 않고 대문자만 변환
      expect(toSnakeCase('User Name')).toBe('user _name')
    })

    it('이미 snake_case인 경우', () => {
      expect(toSnakeCase('user_name')).toBe('user_name')
    })

    it('연속 대문자 처리', () => {
      // 각 대문자마다 언더스코어가 추가됨
      expect(toSnakeCase('HTTPSConnection')).toBe('h_t_t_p_s_connection')
    })
  })

  describe('reorder 추가 테스트', () => {
    it('첫 번째 요소를 마지막으로', () => {
      const list = [1, 2, 3, 4]
      const result = reorder(list, 0, 3)
      expect(result).toEqual([2, 3, 4, 1])
    })

    it('마지막 요소를 첫 번째로', () => {
      const list = [1, 2, 3, 4]
      const result = reorder(list, 3, 0)
      expect(result).toEqual([4, 1, 2, 3])
    })

    it('같은 위치로 이동', () => {
      const list = [1, 2, 3]
      const result = reorder(list, 1, 1)
      expect(result).toEqual([1, 2, 3])
    })
  })

  describe('clamp 추가 테스트', () => {
    it('음수 범위', () => {
      expect(clamp(-5, -10, -1)).toBe(-5)
      expect(clamp(-15, -10, -1)).toBe(-10)
      expect(clamp(0, -10, -1)).toBe(-1)
    })

    it('소수점 값', () => {
      expect(clamp(5.5, 0, 10)).toBe(5.5)
      expect(clamp(10.5, 0, 10)).toBe(10)
    })
  })

  describe('truncate 추가 테스트', () => {
    it('정확히 최대 길이인 경우', () => {
      const result = truncate('12345', 5)
      expect(result).toBe('12345')
    })

    it('한글 문자열 자르기', () => {
      const result = truncate('안녕하세요 반갑습니다', 5)
      // truncate는 maxLength까지만 자르고 ...을 붙임
      expect(result).toBe('안녕하세요...')
    })

    it('빈 문자열', () => {
      const result = truncate('', 10)
      expect(result).toBe('')
    })
  })
})
