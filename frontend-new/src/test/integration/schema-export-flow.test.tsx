import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportDialog } from '@/components/export/ExportDialog'
import * as api from '@/lib/api'
import type { ExportResult } from '@/types'

vi.mock('@/lib/api', () => ({
  exportToSql: vi.fn(),
}))

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
})

describe('스키마 내보내기 플로우', () => {
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('SQL 생성 → 미리보기 → 복사 플로우', async () => {
    const user = userEvent.setup()
    const mockSql = `
CREATE TABLE USER (
  USER_ID BIGINT IDENTITY(1,1) PRIMARY KEY,
  USER_NAME NVARCHAR(100) NOT NULL,
  EMAIL VARCHAR(255) NOT NULL,
  REG_ID VARCHAR(25) NOT NULL,
  REG_DT DATETIME NOT NULL DEFAULT GETDATE(),
  CHG_ID VARCHAR(25),
  CHG_DT DATETIME
);

EXEC sys.sp_addextendedproperty 
  @name=N'MS_Description', 
  @value=N'사용자 정보', 
  @level0type=N'SCHEMA', @level0name=N'dbo',
  @level1type=N'TABLE', @level1name=N'USER';

CREATE INDEX IDX__USER__EMAIL ON USER(EMAIL);
    `.trim()

    const mockResult: ExportResult = {
      sql: mockSql,
      format: 'SQL',
      timestamp: new Date().toISOString(),
    }

    vi.mocked(api.exportToSql).mockResolvedValue(mockResult)

    render(
      <ExportDialog
        projectId="proj1"
        projectName="테스트프로젝트"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // 1. SQL 생성 버튼 클릭
    const generateButton = screen.getByRole('button', { name: /생성/ })
    await user.click(generateButton)

    // 2. API 호출 확인
    await waitFor(() => {
      expect(api.exportToSql).toHaveBeenCalledWith('proj1', expect.any(Object))
    })

    // 3. SQL 미리보기 확인
    await waitFor(() => {
      expect(screen.getByText(/CREATE TABLE USER/)).toBeInTheDocument()
    })

    // 4. 복사 버튼 클릭
    const copyButton = screen.getByRole('button', { name: /복사/ })
    await user.click(copyButton)

    // 5. 클립보드에 복사 확인
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockSql)

    // 6. 복사 성공 메시지 확인
    await waitFor(() => {
      expect(screen.getByText(/복사/)).toBeInTheDocument()
    })
  })

  it('SQL 생성 → 다운로드 플로우', async () => {
    const user = userEvent.setup()
    const mockSql = 'CREATE TABLE USER (USER_ID BIGINT);'

    vi.mocked(api.exportToSql).mockResolvedValue({
      sql: mockSql,
      format: 'SQL',
      timestamp: new Date().toISOString(),
    })
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    const createElementSpy = vi.spyOn(document, 'createElement')

    render(
      <ExportDialog
        projectId="proj1"
        projectName="테스트프로젝트"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // 1. SQL 생성
    const generateButton = screen.getByRole('button', { name: /생성/ })
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText(mockSql)).toBeInTheDocument()
    })

    // 2. 다운로드 버튼 클릭
    const downloadButton = screen.getByRole('button', { name: /다운로드/ })
    await user.click(downloadButton)

    // 3. 파일 다운로드 확인
    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(window.URL.createObjectURL).toHaveBeenCalled()
  })

  it('SQL 생성 실패 시 에러 처리', async () => {
    const user = userEvent.setup()

    vi.mocked(api.exportToSql).mockRejectedValue(new Error('테이블이 없습니다'))

    render(
      <ExportDialog
        projectId="proj1"
        projectName="테스트프로젝트"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // 1. SQL 생성 시도
    const generateButton = screen.getByRole('button', { name: /생성/ })
    await user.click(generateButton)

    // 2. 에러 처리 확인 (토스트 메시지는 별도 스토어에서 처리)
    await waitFor(() => {
      expect(api.exportToSql).toHaveBeenCalled()
    })

    // 3. 복사/다운로드 버튼이 비활성화되어야 함
    const copyButton = screen.queryByRole('button', { name: /복사/ })
    const downloadButton = screen.queryByRole('button', { name: /다운로드/ })

    if (copyButton) expect(copyButton).toBeDisabled()
    if (downloadButton) expect(downloadButton).toBeDisabled()
  })

  it('여러 테이블이 포함된 SQL 생성', async () => {
    const user = userEvent.setup()
    const mockSql = `
CREATE TABLE USER (
  USER_ID BIGINT IDENTITY(1,1) PRIMARY KEY,
  USER_NAME NVARCHAR(100) NOT NULL,
  REG_ID VARCHAR(25) NOT NULL,
  REG_DT DATETIME NOT NULL DEFAULT GETDATE(),
  CHG_ID VARCHAR(25),
  CHG_DT DATETIME
);

EXEC sys.sp_addextendedproperty 
  @name=N'MS_Description', 
  @value=N'사용자 정보', 
  @level0type=N'SCHEMA', @level0name=N'dbo',
  @level1type=N'TABLE', @level1name=N'USER';

CREATE TABLE ORDER_ITEM (
  ORDER_ID BIGINT NOT NULL,
  PRODUCT_ID BIGINT NOT NULL,
  QUANTITY INT NOT NULL,
  REG_ID VARCHAR(25) NOT NULL,
  REG_DT DATETIME NOT NULL DEFAULT GETDATE(),
  CHG_ID VARCHAR(25),
  CHG_DT DATETIME,
  PRIMARY KEY (ORDER_ID, PRODUCT_ID)
);

EXEC sys.sp_addextendedproperty 
  @name=N'MS_Description', 
  @value=N'주문 항목', 
  @level0type=N'SCHEMA', @level0name=N'dbo',
  @level1type=N'TABLE', @level1name=N'ORDER_ITEM';

CREATE INDEX IDX__ORDER_ITEM__PRODUCT_ID ON ORDER_ITEM(PRODUCT_ID);

ALTER TABLE ORDER_ITEM
  ADD CONSTRAINT FK__ORDER_ITEM__ORDER_ID
  FOREIGN KEY (ORDER_ID) REFERENCES USER(USER_ID);
    `.trim()

    vi.mocked(api.exportToSql).mockResolvedValue({
      sql: mockSql,
      format: 'SQL',
      timestamp: new Date().toISOString(),
    })

    render(
      <ExportDialog
        projectId="proj1"
        projectName="테스트프로젝트"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    const generateButton = screen.getByRole('button', { name: /생성/ })
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText(/CREATE TABLE USER/)).toBeInTheDocument()
      expect(screen.getByText(/CREATE TABLE ORDER_ITEM/)).toBeInTheDocument()
      expect(screen.getByText(/ALTER TABLE ORDER_ITEM/)).toBeInTheDocument()
    })
  })

  it('내보내기 옵션 변경 후 SQL 재생성', async () => {
    const user = userEvent.setup()
    const mockSqlWithDrop = `
DROP TABLE IF EXISTS USER;

CREATE TABLE USER (
  USER_ID BIGINT IDENTITY(1,1) PRIMARY KEY,
  USER_NAME NVARCHAR(100) NOT NULL
);
    `.trim()

    const mockSqlWithoutDrop = `
CREATE TABLE USER (
  USER_ID BIGINT IDENTITY(1,1) PRIMARY KEY,
  USER_NAME NVARCHAR(100) NOT NULL
);
    `.trim()

    vi.mocked(api.exportToSql)
      .mockResolvedValueOnce({
        sql: mockSqlWithoutDrop,
        format: 'SQL',
        timestamp: new Date().toISOString(),
      })
      .mockResolvedValueOnce({
        sql: mockSqlWithDrop,
        format: 'SQL',
        timestamp: new Date().toISOString(),
      })

    render(
      <ExportDialog
        projectId="proj1"
        projectName="테스트프로젝트"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // 1. 기본 옵션으로 SQL 생성
    const generateButton = screen.getByRole('button', { name: /생성/ })
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText(/CREATE TABLE USER/)).toBeInTheDocument()
      expect(screen.queryByText(/DROP TABLE/)).not.toBeInTheDocument()
    })

    // 2. DROP 문 포함 옵션 체크
    const dropCheckbox = screen.getByRole('checkbox', { name: /DROP 문 포함/ })
    await user.click(dropCheckbox)

    // 3. SQL 재생성
    await user.click(generateButton)

    await waitFor(() => {
      expect(api.exportToSql).toHaveBeenCalledTimes(2)
      expect(api.exportToSql).toHaveBeenLastCalledWith('proj1', expect.objectContaining({
        includeDropStatements: true,
      }))
    })
  })

  it('DB 스키마 가이드 준수 확인 표시', async () => {
    const user = userEvent.setup()
    const mockSql = `
CREATE TABLE USER (
  USER_ID BIGINT IDENTITY(1,1) PRIMARY KEY,
  USER_NAME NVARCHAR(100) NOT NULL,
  REG_ID VARCHAR(25) NOT NULL,
  REG_DT DATETIME NOT NULL DEFAULT GETDATE(),
  CHG_ID VARCHAR(25),
  CHG_DT DATETIME
);

EXEC sys.sp_addextendedproperty 
  @name=N'MS_Description', 
  @value=N'사용자 정보', 
  @level0type=N'SCHEMA', @level0name=N'dbo',
  @level1type=N'TABLE', @level1name=N'USER';

CREATE CLUSTERED INDEX PK__USER__USER_ID ON USER(USER_ID);
    `.trim()

    vi.mocked(api.exportToSql).mockResolvedValue({
      sql: mockSql,
      format: 'SQL',
      timestamp: new Date().toISOString(),
    })

    render(
      <ExportDialog
        projectId="proj1"
        projectName="테스트프로젝트"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    const generateButton = screen.getByRole('button', { name: /생성/ })
    await user.click(generateButton)

    // DB 스키마 가이드 준수 확인 섹션 표시
    await waitFor(() => {
      expect(screen.getByText(/DB 스키마 가이드 준수 확인/)).toBeInTheDocument()
      expect(screen.getByText(/모든 객체명 대문자 사용/)).toBeInTheDocument()
      expect(screen.getByText(/MS_Description으로 한글 설명 등록/)).toBeInTheDocument()
      expect(screen.getByText(/시스템 속성 컬럼 포함/)).toBeInTheDocument()
      expect(screen.getByText(/명명 규칙 준수/)).toBeInTheDocument()
    })
  })

  it('SQL 스크립트 줄 수 표시', async () => {
    const user = userEvent.setup()
    const mockSql = `
CREATE TABLE USER (
  USER_ID BIGINT IDENTITY(1,1) PRIMARY KEY,
  USER_NAME NVARCHAR(100) NOT NULL
);

CREATE TABLE PRODUCT (
  PRODUCT_ID BIGINT IDENTITY(1,1) PRIMARY KEY,
  PRODUCT_NAME NVARCHAR(200) NOT NULL
);
    `.trim()

    vi.mocked(api.exportToSql).mockResolvedValue({
      sql: mockSql,
      format: 'SQL',
      timestamp: new Date().toISOString(),
    })

    render(
      <ExportDialog
        projectId="proj1"
        projectName="테스트프로젝트"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    const generateButton = screen.getByRole('button', { name: /생성/ })
    await user.click(generateButton)

    // SQL 줄 수 표시 확인
    await waitFor(() => {
      const lineCount = mockSql.split('\n').length
      expect(screen.getByText(new RegExp(`${lineCount} 줄`))).toBeInTheDocument()
    })
  })

  it('파일명에 프로젝트명과 날짜 포함', async () => {
    const user = userEvent.setup()
    const mockSql = 'CREATE TABLE USER (USER_ID BIGINT);'

    vi.mocked(api.exportToSql).mockResolvedValue({
      sql: mockSql,
      format: 'SQL',
      timestamp: new Date().toISOString(),
    })
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    
    const createElementSpy = vi.spyOn(document, 'createElement')
    let capturedLink: HTMLAnchorElement | null = null
    createElementSpy.mockImplementation((tagName) => {
      const element = document.createElement(tagName)
      if (tagName === 'a') {
        capturedLink = element as HTMLAnchorElement
      }
      return element
    })

    render(
      <ExportDialog
        projectId="proj1"
        projectName="고객관리시스템"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    const generateButton = screen.getByRole('button', { name: /생성/ })
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText(mockSql)).toBeInTheDocument()
    })

    const downloadButton = screen.getByRole('button', { name: /다운로드/ })
    await user.click(downloadButton)

    // 파일명 형식 확인: {프로젝트명}_schema_{날짜}.sql
    expect(capturedLink?.download).toMatch(/고객관리시스템_schema_\d{4}-\d{2}-\d{2}\.sql/)
  })
})
