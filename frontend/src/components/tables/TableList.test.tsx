import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TableList } from './TableList'
import { useTableStore } from '@/stores/tableStore'
import type { Table } from '@/types'

vi.mock('@/stores/tableStore', () => ({
  useTableStore: vi.fn(),
}))

vi.mock('./CreateTableDialog', () => ({
  CreateTableDialog: ({ open }: { open: boolean }) => 
    open ? <div>Create Table Dialog</div> : null,
}))

vi.mock('./DeleteTableDialog', () => ({
  DeleteTableDialog: ({ open }: { open: boolean }) => 
    open ? <div>Delete Table Dialog</div> : null,
}))

describe('TableList', () => {
  const mockTables: Table[] = [
    {
      id: '1',
      projectId: 'proj1',
      name: 'USER',
      description: '사용자 정보',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      projectId: 'proj1',
      name: 'ORDER',
      description: '주문 정보',
      createdAt: '2024-01-16T10:00:00Z',
      updatedAt: '2024-01-16T10:00:00Z',
    },
  ]

  const mockDeleteTable = vi.fn()
  const mockOnSelectTable = vi.fn()
  const mockOnTableCreated = vi.fn()
  const mockOnTableDeleted = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTableStore).mockReturnValue({
      deleteTable: mockDeleteTable,
      isLoading: false,
      tables: [],
      selectedTable: null,
      error: null,
      fetchTables: vi.fn(),
      createTable: vi.fn(),
      updateTable: vi.fn(),
      selectTable: vi.fn(),
    } as ReturnType<typeof useTableStore>)
  })

  it('테이블 목록을 렌더링함', () => {
    render(
      <TableList
        projectId="proj1"
        tables={mockTables}
        selectedTableId={null}
        onSelectTable={mockOnSelectTable}
        onTableCreated={mockOnTableCreated}
        onTableDeleted={mockOnTableDeleted}
      />
    )

    expect(screen.getByText('USER')).toBeInTheDocument()
    expect(screen.getByText('사용자 정보')).toBeInTheDocument()
    expect(screen.getByText('ORDER')).toBeInTheDocument()
    expect(screen.getByText('주문 정보')).toBeInTheDocument()
  })

  it('테이블 개수를 표시함', () => {
    render(
      <TableList
        projectId="proj1"
        tables={mockTables}
        selectedTableId={null}
        onSelectTable={mockOnSelectTable}
        onTableCreated={mockOnTableCreated}
        onTableDeleted={mockOnTableDeleted}
      />
    )

    expect(screen.getByText('총 2개의 테이블')).toBeInTheDocument()
  })

  it('테이블이 없을 때 빈 상태 표시', () => {
    render(
      <TableList
        projectId="proj1"
        tables={[]}
        selectedTableId={null}
        onSelectTable={mockOnSelectTable}
        onTableCreated={mockOnTableCreated}
        onTableDeleted={mockOnTableDeleted}
      />
    )

    expect(screen.getByText('아직 테이블이 없습니다')).toBeInTheDocument()
    expect(screen.getByText('첫 테이블 만들기')).toBeInTheDocument()
  })

  it('테이블 선택 시 onSelectTable 호출', async () => {
    const user = userEvent.setup()
    render(
      <TableList
        projectId="proj1"
        tables={mockTables}
        selectedTableId={null}
        onSelectTable={mockOnSelectTable}
        onTableCreated={mockOnTableCreated}
        onTableDeleted={mockOnTableDeleted}
      />
    )

    const userTable = screen.getByText('USER').closest('.cursor-pointer')
    if (userTable) {
      await user.click(userTable)
    }

    expect(mockOnSelectTable).toHaveBeenCalledWith('1')
  })

  it('선택된 테이블이 하이라이트됨', () => {
    render(
      <TableList
        projectId="proj1"
        tables={mockTables}
        selectedTableId="1"
        onSelectTable={mockOnSelectTable}
        onTableCreated={mockOnTableCreated}
        onTableDeleted={mockOnTableDeleted}
      />
    )

    const userTable = screen.getByText('USER').closest('.cursor-pointer')
    expect(userTable).toHaveClass('border-blue-500')
  })

  it('추가 버튼 클릭 시 생성 다이얼로그 열림', async () => {
    const user = userEvent.setup()
    render(
      <TableList
        projectId="proj1"
        tables={mockTables}
        selectedTableId={null}
        onSelectTable={mockOnSelectTable}
        onTableCreated={mockOnTableCreated}
        onTableDeleted={mockOnTableDeleted}
      />
    )

    const addButton = screen.getByRole('button', { name: /추가/ })
    await user.click(addButton)

    expect(screen.getByText('Create Table Dialog')).toBeInTheDocument()
  })
})
