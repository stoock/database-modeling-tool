import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportDialog } from './ExportDialog'
import * as api from '@/lib/api'
import { useToastStore } from '@/stores/toastStore'

vi.mock('@/lib/api', () => ({
  exportToSql: vi.fn(),
}))

vi.mock('@/stores/toastStore', () => ({
  useToastStore: vi.fn(),
}))

// Clipboard API 모킹
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
})

describe('ExportDialog', () => {
  const mockOnOpenChange = vi.fn()
  const mockError = vi.fn()
  const mockSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useToastStore).mockReturnValue({
      error: mockError,
      success: mockSuccess,
      info: vi.fn(),
      warning: vi.fn(),
    } as ReturnType<typeof useToastStore>)
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

    // 복사 성공 toast 확인
    await waitFor(() => {
      expect(mockSuccess).toHaveBeenCalledWith('복사 완료', 'SQL 스크립트가 클립보드에 복사되었습니다')
    })
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

    // 여러 닫기 버튼 중 하단의 "닫기" 텍스트 버튼 선택
    const closeButtons = screen.getAllByRole('button', { name: /닫기/ })
    await user.click(closeButtons[closeButtons.length - 1])

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
      expect(mockError).toHaveBeenCalledWith('SQL 생성 실패', 'SQL 스크립트 생성 중 오류가 발생했습니다')
    })
  })
})
