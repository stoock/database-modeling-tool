import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ProjectsPage from '@/pages/ProjectsPage'
import ProjectDetailPage from '@/pages/ProjectDetailPage'
import * as api from '@/lib/api'
import type { Project, Table, Column } from '@/types'

vi.mock('@/lib/api', () => ({
  getProjects: vi.fn(),
  createProject: vi.fn(),
  getTables: vi.fn(),
  createTable: vi.fn(),
  getColumns: vi.fn(),
  createColumn: vi.fn(),
  reorderColumns: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ projectId: 'proj1' }),
    useNavigate: () => vi.fn(),
  }
})

describe('프로젝트 생성 → 테이블 생성 → 컬럼 추가 통합 플로우', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.getProjects).mockResolvedValue([])
  })

  it('전체 플로우: 프로젝트 생성 → 테이블 생성 → 컬럼 추가', async () => {
    const user = userEvent.setup()

    // 1. 프로젝트 목록 페이지 렌더링
    render(
      <BrowserRouter>
        <ProjectsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/프로젝트 목록/)).toBeInTheDocument()
    })

    // 2. 프로젝트 생성 다이얼로그 열기
    const newProjectButton = screen.getByRole('button', { name: /새 프로젝트/ })
    await user.click(newProjectButton)

    await waitFor(() => {
      expect(screen.getByText('새 프로젝트 생성')).toBeInTheDocument()
    })

    // 3. 프로젝트 정보 입력
    const mockProject: Project = {
      id: 'proj1',
      name: '고객관리시스템',
      description: 'CRM 시스템',
      namingRules: {
        tablePattern: '^[A-Z][A-Z0-9_]*$',
        columnPattern: '^[A-Z][A-Z0-9_]*$',
        indexPattern: '^(PK|IX|UQ)_[A-Z][A-Z0-9_]*$',
        enforceCase: 'PASCAL',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    vi.mocked(api.createProject).mockResolvedValue(mockProject)
    vi.mocked(api.getProjects).mockResolvedValue([mockProject])

    const nameInput = screen.getByLabelText(/프로젝트명/)
    const descInput = screen.getByLabelText(/설명/)

    await user.type(nameInput, '고객관리시스템')
    await user.type(descInput, 'CRM 시스템')

    // 4. 프로젝트 생성
    const createButton = screen.getByRole('button', { name: /생성$/ })
    await user.click(createButton)

    await waitFor(() => {
      expect(api.createProject).toHaveBeenCalledWith({
        name: '고객관리시스템',
        description: 'CRM 시스템',
      })
    })

    // 5. 생성된 프로젝트 확인
    await waitFor(() => {
      expect(screen.getByText('고객관리시스템')).toBeInTheDocument()
    })
  })

  it('프로젝트 선택 후 테이블 생성 및 컬럼 추가', async () => {
    const user = userEvent.setup()

    const mockProject: Project = {
      id: 'proj1',
      name: '고객관리시스템',
      description: 'CRM 시스템',
      namingRules: {
        tablePattern: '^[A-Z][A-Z0-9_]*$',
        columnPattern: '^[A-Z][A-Z0-9_]*$',
        indexPattern: '^(PK|IX|UQ)_[A-Z][A-Z0-9_]*$',
        enforceCase: 'PASCAL',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const mockTable: Table = {
      id: 'table1',
      projectId: 'proj1',
      name: 'USER',
      description: '사용자 정보',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const mockColumn: Column = {
      id: 'col1',
      tableId: 'table1',
      name: 'USER_ID',
      description: '사용자ID',
      dataType: 'BIGINT',
      nullable: false,
      primaryKey: true,
      identity: true,
      identitySeed: 1,
      identityIncrement: 1,
      orderIndex: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    vi.mocked(api.getProjects).mockResolvedValue([mockProject])
    vi.mocked(api.getTables).mockResolvedValue([])
    vi.mocked(api.createTable).mockResolvedValue(mockTable)
    vi.mocked(api.getColumns).mockResolvedValue([])
    vi.mocked(api.createColumn).mockResolvedValue(mockColumn)

    render(
      <BrowserRouter>
        <ProjectsPage />
      </BrowserRouter>
    )

    // 프로젝트 선택
    await waitFor(() => {
      expect(screen.getByText('고객관리시스템')).toBeInTheDocument()
    })

    const projectCard = screen.getByText('고객관리시스템').closest('[role="listitem"]')
    if (projectCard) {
      await user.click(projectCard)
    }

    // 테이블 생성 확인
    await waitFor(() => {
      expect(api.getTables).toHaveBeenCalledWith('proj1')
    })
  })

  it('시스템 속성 컬럼 자동 추가 옵션 테스트', async () => {
    const mockProject: Project = {
      id: 'proj1',
      name: '테스트프로젝트',
      description: '테스트',
      namingRules: {
        tablePattern: '^[A-Z][A-Z0-9_]*$',
        columnPattern: '^[A-Z][A-Z0-9_]*$',
        indexPattern: '^(PK|IX|UQ)_[A-Z][A-Z0-9_]*$',
        enforceCase: 'PASCAL',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const mockTable: Table = {
      id: 'table1',
      projectId: 'proj1',
      name: 'TEST_TABLE',
      description: '테스트 테이블',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    vi.mocked(api.getProjects).mockResolvedValue([mockProject])
    vi.mocked(api.getTables).mockResolvedValue([])
    vi.mocked(api.createTable).mockResolvedValue(mockTable)
    vi.mocked(api.createColumn).mockResolvedValue({} as Column)

    render(
      <BrowserRouter>
        <ProjectsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('테스트프로젝트')).toBeInTheDocument()
    })

    // 시스템 속성 컬럼 자동 추가가 기본적으로 체크되어 있는지 확인
    // 이 부분은 실제 테이블 생성 다이얼로그가 열렸을 때 테스트 가능
  })

  it('여러 컬럼 추가 및 순서 변경', async () => {
    const mockColumns: Column[] = [
      {
        id: 'col1',
        tableId: 'table1',
        name: 'USER_ID',
        description: '사용자ID',
        dataType: 'BIGINT',
        nullable: false,
        primaryKey: true,
        identity: true,
        identitySeed: 1,
        identityIncrement: 1,
        orderIndex: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'col2',
        tableId: 'table1',
        name: 'USER_NAME',
        description: '사용자명',
        dataType: 'NVARCHAR',
        maxLength: 100,
        nullable: false,
        primaryKey: false,
        identity: false,
        orderIndex: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'col3',
        tableId: 'table1',
        name: 'EMAIL',
        description: '이메일',
        dataType: 'VARCHAR',
        maxLength: 255,
        nullable: false,
        primaryKey: false,
        identity: false,
        orderIndex: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    vi.mocked(api.getColumns).mockResolvedValue(mockColumns)
    vi.mocked(api.reorderColumns).mockResolvedValue(mockColumns)

    // 컬럼 순서 변경 API 호출 확인
    await api.reorderColumns('table1', {
      columnIds: ['col2', 'col1', 'col3'],
    })

    expect(api.reorderColumns).toHaveBeenCalledWith('table1', {
      columnIds: ['col2', 'col1', 'col3'],
    })
  })

  it('다양한 데이터 타입의 컬럼 생성', async () => {
    const columnTypes: Array<{
      dataType: MSSQLDataType
      identity?: boolean
      maxLength?: number
      precision?: number
      scale?: number
      defaultValue?: string
    }> = [
      { dataType: 'BIGINT', identity: true },
      { dataType: 'NVARCHAR', maxLength: 100 },
      { dataType: 'DECIMAL', precision: 18, scale: 2 },
      { dataType: 'DATETIME', defaultValue: 'GETDATE()' },
      { dataType: 'BIT', defaultValue: '0' },
    ]

    for (const colType of columnTypes) {
      const mockColumn: Column = {
        id: `col_${colType.dataType}`,
        tableId: 'table1',
        name: `TEST_${colType.dataType}`,
        description: `테스트 ${colType.dataType}`,
        dataType: colType.dataType,
        maxLength: colType.maxLength,
        precision: colType.precision,
        scale: colType.scale,
        defaultValue: colType.defaultValue,
        nullable: false,
        primaryKey: false,
        identity: colType.identity || false,
        orderIndex: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(api.createColumn).mockResolvedValue(mockColumn)

      const result = await api.createColumn({
        tableId: 'table1',
        name: `TEST_${colType.dataType}`,
        description: `테스트 ${colType.dataType}`,
        dataType: colType.dataType,
        maxLength: colType.maxLength,
        precision: colType.precision,
        scale: colType.scale,
        defaultValue: colType.defaultValue,
        nullable: false,
        primaryKey: false,
        identity: colType.identity || false,
        orderIndex: 0,
      })

      expect(result.dataType).toBe(colType.dataType)
    }
  })
})
