import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateColumnDialog } from './CreateColumnDialog'
import * as api from '@/lib/api'

vi.mock('@/lib/api', () => ({
  createColumn: vi.fn(),
}))

vi.mock('@/components/validation/ValidationBadge', () => ({
  ValidationBadge: ({ result }: { result: { message?: string } | null }) => 
    result ? <div data-testid="validation-badge">{result.message}</div> : null,
}))

describe('CreateColumnDialog', () => {
  const mockOnOpenChange = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('다이얼로그가 열릴 때 렌더링됨', () => {
    render(
      <CreateColumnDialog
        tableId="table1"
        tableName="USER"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByText('컬럼 추가')).toBeInTheDocument()
    expect(screen.getByLabelText(/컬럼명/)).toBeInTheDocument()
  })

  it('필수 필드 검증', async () => {
    render(
      <CreateColumnDialog
        tableId="table1"
        tableName="USER"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    // 필수 필드가 비어있으면 생성 버튼이 비활성화됨
    const submitButton = screen.getByRole('button', { name: /생성/ })
    expect(submitButton).toBeDisabled()
  })

  it.skip('데이터 타입 선택 시 조건부 필드 표시', async () => {
    const user = userEvent.setup()
    render(
      <CreateColumnDialog
        tableId="table1"
        tableName="USER"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    // VARCHAR 선택 시 길이 필드 표시
    const dataTypeSelect = screen.getByLabelText(/데이터 타입/)
    await user.click(dataTypeSelect)

    // VARCHAR 옵션이 여러 개 있을 수 있으므로 getAllByText 사용
    const varcharOptions = screen.getAllByText('VARCHAR')
    await user.click(varcharOptions[varcharOptions.length - 1])

    await waitFor(() => {
      expect(screen.getByLabelText(/길이/)).toBeInTheDocument()
    })
  })

  it.skip('IDENTITY 체크 시 정수형 타입만 허용', async () => {
    const user = userEvent.setup()
    render(
      <CreateColumnDialog
        tableId="table1"
        tableName="USER"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    // VARCHAR 선택
    const dataTypeSelect = screen.getByLabelText(/데이터 타입/)
    await user.click(dataTypeSelect)

    // VARCHAR 옵션이 여러 개 있을 수 있으므로 getAllByText 사용
    const varcharOptions = screen.getAllByText('VARCHAR')
    await user.click(varcharOptions[varcharOptions.length - 1])

    // IDENTITY 체크박스가 비활성화되어야 함
    const identityCheckbox = screen.getByLabelText(/IDENTITY/)
    expect(identityCheckbox).toBeDisabled()
  })

  it('컬럼 생성 성공', async () => {
    const user = userEvent.setup()
    vi.mocked(api.createColumn).mockResolvedValue({
      id: 'col1',
      tableId: 'table1',
      name: 'USER_ID',
      description: '사용자ID',
      dataType: 'BIGINT',
      nullable: false,
      primaryKey: true,
      identity: false,
      orderIndex: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    render(
      <CreateColumnDialog
        tableId="table1"
        tableName="USER"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    const nameInput = screen.getByLabelText(/컬럼명/)
    const descInput = screen.getByLabelText(/Description/)

    await user.type(nameInput, 'USER_ID')
    await user.type(descInput, '사용자ID')

    const submitButton = screen.getByRole('button', { name: /생성/ })
    await user.click(submitButton)

    await waitFor(() => {
      expect(api.createColumn).toHaveBeenCalled()
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('취소 버튼 클릭 시 다이얼로그 닫힘', async () => {
    const user = userEvent.setup()
    render(
      <CreateColumnDialog
        tableId="table1"
        tableName="USER"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /취소/ })
    await user.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})
