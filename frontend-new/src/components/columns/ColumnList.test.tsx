import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColumnList } from './ColumnList'
import type { Column } from '@/types'

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  verticalListSortingStrategy: {},
  arrayMove: <T,>(arr: T[], from: number, to: number): T[] => {
    const newArr = [...arr]
    const [item] = newArr.splice(from, 1)
    newArr.splice(to, 0, item)
    return newArr
  },
}))

vi.mock('./SortableRow', () => ({
  SortableRow: ({ column, onEdit, onDelete }: { column: Column; onEdit: (col: Column) => void; onDelete: (col: Column) => void }) => (
    <div data-testid={`column-${column.id}`}>
      <span>{column.name}</span>
      <button onClick={() => onEdit(column)}>Edit</button>
      <button onClick={() => onDelete(column)}>Delete</button>
    </div>
  ),
}))

describe('ColumnList', () => {
  const mockColumns: Column[] = [
    {
      id: '1',
      tableId: 'table1',
      name: 'USER_ID',
      description: '사용자ID',
      dataType: 'BIGINT',
      nullable: false,
      primaryKey: true,
      identity: true,
      orderIndex: 0,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      tableId: 'table1',
      name: 'USER_NAME',
      description: '사용자명',
      dataType: 'NVARCHAR',
      maxLength: 100,
      nullable: false,
      primaryKey: false,
      identity: false,
      orderIndex: 1,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
  ]

  const mockOnReorder = vi.fn()
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()

  it('컬럼 목록을 렌더링함', () => {
    render(
      <ColumnList
        columns={mockColumns}
        onReorder={mockOnReorder}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('USER_ID')).toBeInTheDocument()
    expect(screen.getByText('USER_NAME')).toBeInTheDocument()
  })

  it('컬럼이 없을 때 빈 상태 표시', () => {
    render(
      <ColumnList
        columns={[]}
        onReorder={mockOnReorder}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText(/컬럼이 없습니다/)).toBeInTheDocument()
  })

  it('편집 버튼 클릭 시 onEdit 호출', async () => {
    const user = userEvent.setup()
    render(
      <ColumnList
        columns={mockColumns}
        onReorder={mockOnReorder}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const editButtons = screen.getAllByText('Edit')
    await user.click(editButtons[0])

    expect(mockOnEdit).toHaveBeenCalledWith(mockColumns[0])
  })

  it('삭제 버튼 클릭 시 onDelete 호출', async () => {
    const user = userEvent.setup()
    render(
      <ColumnList
        columns={mockColumns}
        onReorder={mockOnReorder}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const deleteButtons = screen.getAllByText('Delete')
    await user.click(deleteButtons[0])

    expect(mockOnDelete).toHaveBeenCalledWith(mockColumns[0])
  })
})
