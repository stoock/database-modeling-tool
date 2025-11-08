import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportDialog } from './ExportDialog'
import * as api from '@/lib/api'

vi.mock('@/lib/api', () => ({
  exportToSql: vi.fn(),
}))

// Clipboard API 모킹
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
})

describe('ExportDialog', () => {
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('다이얼로그가 열릴 때 렌더링됨', () => {
    render(
      <ExportDialog
        projectId="proj1"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    expect(screen.getByText(/스키마 내보내기/)).toBeInTheDocument()
  })

  it('SQL 생성 버튼 클릭 시 SQL 생성', async () => {
    const user = userEvent.setup()
    const mockSql = 'CREATE TABLE USER (USER_ID BIGINT);'
    vi.mocked(api.exportToSql).mockResolvedValue({
      sql: mockSql,
      format: 'SQL',
      timestamp: new Date().toISOString(),
    })

    render(
      <ExportDialog
        projectId="proj1"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    const generateButton = screen.getByRole('button', { name: /생성/ })
    await user.click(generateButton)

    await waitFor(() => {
      expect(api.exportToSql).toHaveBeenCalledWith('proj1', expect.any(Object))
    })

    expect(screen.getByText(mockSql)).toBeInTheDocument()
  })

  it('SQL 복사 버튼 클릭 시 클립보드에 복사', async () => {
    const user = userEvent.setup()
    const mockSql = 'CREATE TABLE USER (USER_ID BIGINT);'
    vi.mocked(api.exportToSql).mockResolvedValue({
      sql: mockSql,
      format: 'SQL',
      timestamp: new Date().toISOString(),
    })

    render(
      <ExportDialog
        projectId="proj1"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // SQL 생성
    const generateButton = screen.getByRole('button', { name: /생성/ })
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText(mockSql)).toBeInTheDocument()
    })

    // 복사 버튼 클릭
    const copyButton = screen.getByRole('button', { name: /복사/ })
    await user.click(copyButton)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockSql)
  })

  it('다운로드 버튼 클릭 시 파일 다운로드', async () => {
    const user = userEvent.setup()
    const mockSql = 'CREATE TABLE USER (USER_ID BIGINT);'
    vi.mocked(api.exportToSql).mockResolvedValue({
      sql: mockSql,
      format: 'SQL',
      timestamp: new Date().toISOString(),
    })

    // Blob과 URL.createObjectURL 모킹
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    const createElementSpy = vi.spyOn(document, 'createElement')

    render(
      <ExportDialog
        projectId="proj1"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // SQL 생성
    const generateButton = screen.getByRole('button', { name: /생성/ })
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText(mockSql)).toBeInTheDocument()
    })

    // 다운로드 버튼 클릭
    const downloadButton = screen.getByRole('button', { name: /다운로드/ })
    await user.click(downloadButton)

    expect(createElementSpy).toHaveBeenCalledWith('a')
  })

  it('닫기 버튼 클릭 시 다이얼로그 닫힘', async () => {
    const user = userEvent.setup()
    render(
      <ExportDialog
        projectId="proj1"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    const closeButton = screen.getByRole('button', { name: /닫기/ })
    await user.click(closeButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('SQL 생성 실패 시 에러 메시지 표시', async () => {
    const user = userEvent.setup()
    vi.mocked(api.exportToSql).mockRejectedValue(new Error('SQL 생성 실패'))

    render(
      <ExportDialog
        projectId="proj1"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    const generateButton = screen.getByRole('button', { name: /생성/ })
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText(/실패/)).toBeInTheDocument()
    })
  })
})
