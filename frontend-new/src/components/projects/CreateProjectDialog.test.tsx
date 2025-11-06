import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateProjectDialog from './CreateProjectDialog'
import { useProjectStore } from '@/stores/projectStore'

vi.mock('@/stores/projectStore', () => ({
  useProjectStore: vi.fn(),
}))

describe('CreateProjectDialog', () => {
  const mockCreateProject = vi.fn()
  const mockOnOpenChange = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useProjectStore).mockReturnValue({
      createProject: mockCreateProject,
      projects: [],
      selectedProject: null,
      isLoading: false,
      error: null,
      fetchProjects: vi.fn(),
      selectProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProject: vi.fn(),
    } as ReturnType<typeof useProjectStore>)
  })

  it('다이얼로그가 열릴 때 렌더링됨', () => {
    render(
      <CreateProjectDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByText('새 프로젝트 생성')).toBeInTheDocument()
    expect(screen.getByLabelText(/프로젝트명/)).toBeInTheDocument()
  })

  it('다이얼로그가 닫혀있을 때 렌더링되지 않음', () => {
    render(
      <CreateProjectDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.queryByText('새 프로젝트 생성')).not.toBeInTheDocument()
  })

  it('필수 필드 검증', async () => {
    const user = userEvent.setup()
    render(
      <CreateProjectDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    const submitButton = screen.getByRole('button', { name: /생성$/ })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('프로젝트명을 입력하세요')).toBeInTheDocument()
    })

    expect(mockCreateProject).not.toHaveBeenCalled()
  })

  it('프로젝트 생성 성공', async () => {
    const user = userEvent.setup()
    mockCreateProject.mockResolvedValue({ id: '1', name: '새 프로젝트' })

    render(
      <CreateProjectDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    const nameInput = screen.getByLabelText(/프로젝트명/)
    const descriptionInput = screen.getByLabelText(/설명/)
    const submitButton = screen.getByRole('button', { name: /생성$/ })

    await user.type(nameInput, '새 프로젝트')
    await user.type(descriptionInput, '프로젝트 설명')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledWith({
        name: '새 프로젝트',
        description: '프로젝트 설명',
      })
    })

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    expect(mockOnSuccess).toHaveBeenCalled()
  })

  it('취소 버튼 클릭 시 다이얼로그 닫힘', async () => {
    const user = userEvent.setup()
    render(
      <CreateProjectDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /취소/ })
    await user.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('프로젝트명 최대 길이 검증', async () => {
    const user = userEvent.setup()
    render(
      <CreateProjectDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    const nameInput = screen.getByLabelText(/프로젝트명/)
    const longName = 'a'.repeat(101)
    
    await user.type(nameInput, longName)
    
    const submitButton = screen.getByRole('button', { name: /생성$/ })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/100자 이내로 입력하세요/)).toBeInTheDocument()
    })
  })

  it('설명 없이도 프로젝트 생성 가능', async () => {
    const user = userEvent.setup()
    mockCreateProject.mockResolvedValue({ id: '1', name: '새 프로젝트' })

    render(
      <CreateProjectDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    const nameInput = screen.getByLabelText(/프로젝트명/)
    await user.type(nameInput, '새 프로젝트')

    const submitButton = screen.getByRole('button', { name: /생성$/ })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledWith({
        name: '새 프로젝트',
        description: '',
      })
    })
  })
})
