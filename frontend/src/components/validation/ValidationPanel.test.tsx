import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ValidationPanel } from './ValidationPanel'
import * as api from '@/lib/api'

vi.mock('@/lib/api', () => ({
  validateProject: vi.fn(),
}))

describe('ValidationPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('검증 패널을 렌더링함', () => {
    render(<ValidationPanel projectId="proj1" />)

    expect(screen.getByText('명명 규칙 검증')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /검증 실행/ })).toBeInTheDocument()
  })

  it('검증 실행 버튼 클릭 시 검증 수행', async () => {
    const user = userEvent.setup()
    const mockValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    }
    vi.mocked(api.validateProject).mockResolvedValue(mockValidationResult)

    render(<ValidationPanel projectId="proj1" />)

    const validateButton = screen.getByRole('button', { name: /검증 실행/ })
    await user.click(validateButton)

    expect(api.validateProject).toHaveBeenCalledWith('proj1')
  })

  it('검증 성공 시 결과 표시', async () => {
    const user = userEvent.setup()
    const mockValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    }
    vi.mocked(api.validateProject).mockResolvedValue(mockValidationResult)

    render(<ValidationPanel projectId="proj1" />)

    const validateButton = screen.getByRole('button', { name: /검증 실행/ })
    await user.click(validateButton)

    await screen.findByText(/모든 검증을 통과했습니다/)
  })

  it('검증 에러 시 에러 목록 표시', async () => {
    const user = userEvent.setup()
    const mockValidationResult = {
      isValid: false,
      errors: [
        { message: '테이블명이 올바르지 않습니다', tableName: 'user' },
        { message: 'PK 컬럼이 없습니다', tableName: 'ORDER' },
      ],
      warnings: [],
    }
    vi.mocked(api.validateProject).mockResolvedValue(mockValidationResult)

    render(<ValidationPanel projectId="proj1" />)

    const validateButton = screen.getByRole('button', { name: /검증 실행/ })
    await user.click(validateButton)

    await screen.findByText(/테이블명이 올바르지 않습니다/)
    expect(screen.getByText(/PK 컬럼이 없습니다/)).toBeInTheDocument()
  })

  it('경고 메시지 표시', async () => {
    const user = userEvent.setup()
    const mockValidationResult = {
      isValid: true,
      errors: [],
      warnings: [
        { message: '인덱스가 없습니다', tableName: 'USER' },
      ],
    }
    vi.mocked(api.validateProject).mockResolvedValue(mockValidationResult)

    render(<ValidationPanel projectId="proj1" />)

    const validateButton = screen.getByRole('button', { name: /검증 실행/ })
    await user.click(validateButton)

    await screen.findByText(/인덱스가 없습니다/)
  })
})
