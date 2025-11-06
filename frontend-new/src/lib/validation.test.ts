import { describe, it, expect } from 'vitest'
import {
  validateUpperCase,
  validatePrimaryKeyColumnName,
  validateTableDescription,
  validateDataTypeProperties,
  validateIndexName,
  generateIndexName,
  isIntegerType,
  requiresLength,
  requiresPrecisionScale,
  supportsIdentity,
} from './validation'

describe('validation', () => {
  describe('validateUpperCase', () => {
    it('빈 문자열은 유효하지 않음', () => {
      const result = validateUpperCase('')
      expect(result.isValid).toBe(false)
    })

    it('PascalCase는 유효함', () => {
      const result = validateUpperCase('User')
      expect(result.isValid).toBe(true)
    })

    it('UPPER_SNAKE_CASE는 유효함', () => {
      const result = validateUpperCase('USER_ID')
      expect(result.isValid).toBe(true)
    })

    it('소문자는 유효하지 않음', () => {
      const result = validateUpperCase('user')
      expect(result.isValid).toBe(false)
      expect(result.suggestion).toBeDefined()
    })
  })

  describe('validatePrimaryKeyColumnName', () => {
    it('단독명칭은 유효하지 않음', () => {
      const result = validatePrimaryKeyColumnName('ID', 'USER')
      expect(result.isValid).toBe(false)
    })

    it('테이블명을 포함하지 않으면 유효하지 않음', () => {
      const result = validatePrimaryKeyColumnName('CUSTOMER_ID', 'USER')
      expect(result.isValid).toBe(false)
    })

    it('테이블명을 포함하면 유효함', () => {
      const result = validatePrimaryKeyColumnName('USER_ID', 'USER')
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateTableDescription', () => {
    it('빈 Description은 유효하지 않음', () => {
      const result = validateTableDescription('', 'USER')
      expect(result.isValid).toBe(false)
    })

    it('테이블명 복사는 유효하지 않음', () => {
      const result = validateTableDescription('USER', 'USER')
      expect(result.isValid).toBe(false)
    })

    it('한글이 없으면 유효하지 않음', () => {
      const result = validateTableDescription('User Table', 'USER')
      expect(result.isValid).toBe(false)
    })

    it('한글 설명은 유효함', () => {
      const result = validateTableDescription('사용자 정보', 'USER')
      expect(result.isValid).toBe(true)
    })

    it('한글명과 상세설명 형식 유효함', () => {
      const result = validateTableDescription('사용자 || 시스템 사용자 정보', 'USER')
      expect(result.isValid).toBe(true)
    })

    it('공백만 있는 Description은 유효하지 않음', () => {
      const result = validateTableDescription('   ', 'USER')
      expect(result.isValid).toBe(false)
    })
  })

  describe('validateDataTypeProperties', () => {
    it('VARCHAR는 길이 필수', () => {
      const result = validateDataTypeProperties('VARCHAR')
      expect(result.isValid).toBe(false)
    })

    it('VARCHAR에 길이 지정 시 유효함', () => {
      const result = validateDataTypeProperties('VARCHAR', 100)
      expect(result.isValid).toBe(true)
    })

    it('NVARCHAR는 길이 필수', () => {
      const result = validateDataTypeProperties('NVARCHAR')
      expect(result.isValid).toBe(false)
    })

    it('DECIMAL은 precision 필수', () => {
      const result = validateDataTypeProperties('DECIMAL')
      expect(result.isValid).toBe(false)
    })

    it('DECIMAL에 precision, scale 지정 시 유효함', () => {
      const result = validateDataTypeProperties('DECIMAL', undefined, 18, 2)
      expect(result.isValid).toBe(true)
    })

    it('NUMERIC에 precision만 지정해도 유효함', () => {
      const result = validateDataTypeProperties('NUMERIC', undefined, 10)
      expect(result.isValid).toBe(true)
    })

    it('INT는 추가 속성 불필요', () => {
      const result = validateDataTypeProperties('INT')
      expect(result.isValid).toBe(true)
    })

    it('DATETIME은 추가 속성 불필요', () => {
      const result = validateDataTypeProperties('DATETIME')
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateIndexName', () => {
    it('PK는 PK__ 접두사 필요', () => {
      const result = validateIndexName('USER_ID', 'CLUSTERED', true, 'USER')
      expect(result.isValid).toBe(false)
    })

    it('클러스터드 인덱스는 CIDX__ 접두사 필요', () => {
      const result = validateIndexName('IDX__USER__NAME', 'CLUSTERED', false, 'USER')
      expect(result.isValid).toBe(false)
    })

    it('올바른 PK 인덱스명', () => {
      const result = validateIndexName('PK__USER__USER_ID', 'CLUSTERED', true, 'USER')
      expect(result.isValid).toBe(true)
    })

    it('올바른 클러스터드 인덱스명', () => {
      const result = validateIndexName('CIDX__USER__NAME', 'CLUSTERED', false, 'USER')
      expect(result.isValid).toBe(true)
    })

    it('올바른 논클러스터드 인덱스명', () => {
      const result = validateIndexName('IDX__USER__EMAIL', 'NONCLUSTERED', false, 'USER')
      expect(result.isValid).toBe(true)
    })
  })

  describe('generateIndexName', () => {
    it('PK 인덱스명 생성', () => {
      const name = generateIndexName('USER', ['USER_ID'], 'CLUSTERED', true)
      expect(name).toBe('PK__USER__USER_ID')
    })

    it('일반 인덱스명 생성', () => {
      const name = generateIndexName('USER', ['NAME', 'EMAIL'], 'NONCLUSTERED', false)
      expect(name).toBe('IDX__USER__NAME__EMAIL')
    })

    it('클러스터드 인덱스명 생성', () => {
      const name = generateIndexName('ORDER', ['ORDER_DATE'], 'CLUSTERED', false)
      expect(name).toBe('CIDX__ORDER__ORDER_DATE')
    })

    it('단일 컬럼 인덱스명 생성', () => {
      const name = generateIndexName('PRODUCT', ['CATEGORY_ID'], 'NONCLUSTERED', false)
      expect(name).toBe('IDX__PRODUCT__CATEGORY_ID')
    })

    it('복합 인덱스명 생성', () => {
      const name = generateIndexName('ORDER_ITEM', ['ORDER_ID', 'PRODUCT_ID', 'STATUS'], 'NONCLUSTERED', false)
      expect(name).toBe('IDX__ORDER_ITEM__ORDER_ID__PRODUCT_ID__STATUS')
    })
  })

  describe('데이터 타입 유틸리티', () => {
    it('isIntegerType', () => {
      expect(isIntegerType('INT')).toBe(true)
      expect(isIntegerType('VARCHAR')).toBe(false)
    })

    it('requiresLength', () => {
      expect(requiresLength('VARCHAR')).toBe(true)
      expect(requiresLength('INT')).toBe(false)
    })

    it('requiresPrecisionScale', () => {
      expect(requiresPrecisionScale('DECIMAL')).toBe(true)
      expect(requiresPrecisionScale('INT')).toBe(false)
    })

    it('supportsIdentity', () => {
      expect(supportsIdentity('INT')).toBe(true)
      expect(supportsIdentity('VARCHAR')).toBe(false)
    })
  })
})
