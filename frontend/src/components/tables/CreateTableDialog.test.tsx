import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateTableDialog } from './CreateTableDialog'
import { useTableStore } from '@/stores/tableStore'
import * as api from '@/lib/api'

vi.mock('@/stores/tableStore', () => ({
  useTableStore: vi.fn(),
}))

vi.mock('@/lib/api', () => ({
  createColumn: vi.fn(),
}))

vi.mock('@/components/validation/ValidationBadge', () => ({
  ValidationBadge: ({ result }: { result: { message?: string } | null }) => 
    result ? <div data-testid="validation-badge">{result.message}</div> : null,
}))

describe('CreateTableDialog', () => {
  const mockCreateTable = vi.fn()
  const mockOnOpenChange = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTableStore).mockReturnValue({
      createTable: mockCreateTable,
      tables: [],
      selectedTable: null,
      isLoading: false,
      error: null,
      fetchTables: vi.fn(),
      updateTable: vi.fn(),
      deleteTable: vi.fn(),
      selectTable: vi.fn(),
    } as ReturnType<typeof useTableStore>)
  })

  it('다이얼로그가 열릴 때 렌더링됨', () => {
    render(
      <CreateTableDialog
        projectId="proj1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByText('테이블 생성')).toBeInTheDocument()
    expect(screen.getByLabelText(/테이블명/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
  })

  it('필수 필드 검증', async () => {
    const user = userEvent.setup()
    render(
      <CreateTableDialog
        projectId="proj1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    const submitButton = screen.getByRole('button', { name: /생성$/ })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('테이블명을 입력하세요')).toBeInTheDocument()
      expect(screen.getByText('Description을 입력하세요')).toBeInTheDocument()
    })
  })

  it('테이블 생성 성공 (시스템 컬럼 포함)', async () => {
    const user = userEvent.setup()
    mockCreateTable.mockResolvedValue({ id: 'table1', name: 'USER' })
    vi.mocked(api.createColumn).mockResolvedValue({
      id: 'col1',
      tableId: 'table1',
      name: 'CREATED_AT',
      description: '생성일시',
      dataType: 'DATETIME',
      nullable: false,
      primaryKey: false,
      identity: false,
      orderIndex: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    render(
      <CreateTableDialog
        projectId="proj1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    const nameInput = screen.getByLabelText(/테이블명/)
    const descInput = screen.getByLabelText(/Description/)

    await user.type(nameInput, 'USER')
    await user.type(descInput, '사용자 정보')

    const submitButton = screen.getByRole('button', { name: /생성$/ })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateTable).toHaveBeenCalledWith({
        projectId: 'proj1',
        name: 'USER',
        description: '사용자 정보',
        addSystemColumns: true,
      })
    })

    // 시스템 컬럼 4개가 생성되었는지 확인
    expect(api.createColumn).toHaveBeenCalledTimes(4)
    expect(mockOnSuccess).toHaveBeenCalled()
  })

  it('시스템 컬럼 체크박스 해제 시 시스템 컬럼 생성 안 함', async () => {
    const user = userEvent.setup()
    mockCreateTable.mockResolvedValue({ id: 'table1', name: 'USER' })

    render(
      <CreateTableDialog
        projectId="proj1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    const nameInput = screen.getByLabelText(/테이블명/)
    const descInput = screen.getByLabelText(/Description/)

    await user.type(nameInput, 'USER')
    await user.type(descInput, '사용자 정보')

    const submitButton = screen.getByRole('button', { name: /생성$/ })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateTable).toHaveBeenCalledWith({
        projectId: 'proj1',
        name: 'USER',
        description: '사용자 정보',
        addSystemColumns: false,
      })
    })

    expect(api.createColumn).not.toHaveBeenCalled()
  })

  it('취소 버튼 클릭 시 다이얼로그 닫힘', async () => {
    const user = userEvent.setup()
    render(
      <CreateTableDialog
        projectId="proj1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /취소/ })
    await user.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('실시간 검증 - 테이블명', async () => {
    const user = userEvent.setup()
    render(
      <CreateTableDialog
        projectId="proj1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    const nameInput = screen.getByLabelText(/테이블명/)
    await user.type(nameInput, 'user')

    // 디바운스 대기
    await waitFor(() => {
      const badges = screen.queryAllByTestId('validation-badge')
      expect(badges.length).toBeGreaterThan(0)
    }, { timeout: 1000 })
  })

  it('시스템 컬럼 체크 시 설명 표시', () => {
    render(
      <CreateTableDialog
        projectId="proj1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    // 시스템 컬럼 설명이 표시되는지 확인 (여러 곳에 나타날 수 있으므로 getAllByText 사용)
    expect(screen.getAllByText(/REG_ID/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/REG_DT/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/CHG_ID/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/CHG_DT/).length).toBeGreaterThan(0)
  })
})
