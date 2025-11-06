import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProjectCard from './ProjectCard'
import type { Project } from '@/types'

describe('ProjectCard', () => {
  const mockProject: Project = {
    id: '1',
    name: '테스트 프로젝트',
    description: '테스트 설명',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  }

  const mockOnSelect = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('프로젝트 정보를 렌더링함', () => {
    render(
      <ProjectCard
        project={mockProject}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('테스트 프로젝트')).toBeInTheDocument()
    expect(screen.getByText('테스트 설명')).toBeInTheDocument()
  })

  it('설명이 없을 때 기본 메시지 표시', () => {
    const projectWithoutDesc = { ...mockProject, description: '' }
    render(
      <ProjectCard
        project={projectWithoutDesc}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('설명이 없습니다')).toBeInTheDocument()
  })

  it('클릭 시 onSelect 호출', async () => {
    const user = userEvent.setup()
    render(
      <ProjectCard
        project={mockProject}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    )

    const card = screen.getByRole('listitem')
    await user.click(card)

    expect(mockOnSelect).toHaveBeenCalledWith(mockProject)
  })

  it('삭제 버튼 클릭 시 onDelete 호출', async () => {
    const user = userEvent.setup()
    render(
      <ProjectCard
        project={mockProject}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    )

    const deleteButton = screen.getByLabelText('테스트 프로젝트 프로젝트 삭제')
    await user.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith(mockProject)
    expect(mockOnSelect).not.toHaveBeenCalled()
  })

  it('Enter 키로 선택 가능', async () => {
    const user = userEvent.setup()
    render(
      <ProjectCard
        project={mockProject}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    )

    const card = screen.getByRole('listitem')
    card.focus()
    await user.keyboard('{Enter}')

    expect(mockOnSelect).toHaveBeenCalledWith(mockProject)
  })

  it('Space 키로 선택 가능', async () => {
    const user = userEvent.setup()
    render(
      <ProjectCard
        project={mockProject}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    )

    const card = screen.getByRole('listitem')
    card.focus()
    await user.keyboard(' ')

    expect(mockOnSelect).toHaveBeenCalledWith(mockProject)
  })

  it('접근성 속성이 올바르게 설정됨', () => {
    render(
      <ProjectCard
        project={mockProject}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    )

    const card = screen.getByRole('listitem')
    expect(card).toHaveAttribute('tabIndex', '0')
    expect(card).toHaveAttribute('aria-label')
  })
})
