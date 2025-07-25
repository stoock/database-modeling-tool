/**
 * 스키마 내보내기 UI 통합 테스트
 * 
 * 이 테스트는 다음 기능들을 검증합니다:
 * 1. SchemaExportPage 컴포넌트 완성 및 라우팅 연결
 * 2. 내보내기 옵션 설정 UI 완성
 * 3. SQL 미리보기 및 다운로드 기능 완성
 * 4. 내보내기 히스토리 및 버전 관리 구현
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import App from '../../App';
import SchemaExportPage from '../../pages/SchemaExportPage';

// Mock API calls
jest.mock('../../services/api', () => ({
  apiClient: {
    getProjects: jest.fn().mockResolvedValue([
      {
        id: '1',
        name: 'Test Project',
        description: 'Test project for schema export',
        namingRules: {
          tablePattern: '^[A-Z][a-zA-Z0-9]*$',
          columnPattern: '^[a-z][a-z0-9_]*$',
          indexPattern: '^IX_[A-Z][a-zA-Z0-9]*_[a-zA-Z0-9]+$',
          enforceCase: 'PASCAL'
        },
        tables: [
          {
            id: '1',
            projectId: '1',
            name: 'User',
            description: 'User table',
            positionX: 0,
            positionY: 0,
            columns: [
              {
                id: '1',
                tableId: '1',
                name: 'id',
                dataType: 'INT',
                isNullable: false,
                isPrimaryKey: true,
                isIdentity: true,
                orderIndex: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              {
                id: '2',
                tableId: '1',
                name: 'name',
                dataType: 'NVARCHAR',
                maxLength: 255,
                isNullable: false,
                isPrimaryKey: false,
                isIdentity: false,
                orderIndex: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            indexes: [
              {
                id: '1',
                tableId: '1',
                name: 'IX_User_Name',
                type: 'NONCLUSTERED',
                isUnique: false,
                columns: [{ columnId: '2', order: 'ASC' }],
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]),
    getProject: jest.fn().mockImplementation((id) => 
      Promise.resolve({
        id,
        name: 'Test Project',
        description: 'Test project for schema export',
        namingRules: {
          tablePattern: '^[A-Z][a-zA-Z0-9]*$',
          columnPattern: '^[a-z][a-z0-9_]*$',
          indexPattern: '^IX_[A-Z][a-zA-Z0-9]*_[a-zA-Z0-9]+$',
          enforceCase: 'PASCAL'
        },
        tables: [
          {
            id: '1',
            projectId: id,
            name: 'User',
            description: 'User table',
            positionX: 0,
            positionY: 0,
            columns: [
              {
                id: '1',
                tableId: '1',
                name: 'id',
                dataType: 'INT',
                isNullable: false,
                isPrimaryKey: true,
                isIdentity: true,
                orderIndex: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              {
                id: '2',
                tableId: '1',
                name: 'name',
                dataType: 'NVARCHAR',
                maxLength: 255,
                isNullable: false,
                isPrimaryKey: false,
                isIdentity: false,
                orderIndex: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            indexes: [
              {
                id: '1',
                tableId: '1',
                name: 'IX_User_Name',
                type: 'NONCLUSTERED',
                isUnique: false,
                columns: [{ columnId: '2', order: 'ASC' }],
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ),
    getTables: jest.fn().mockResolvedValue([]),
    validateProject: jest.fn().mockResolvedValue({
      isValid: true,
      errors: [],
      warnings: [],
    }),
    exportSchema: jest.fn().mockImplementation((projectId, options) => {
      const { format } = options;
      
      let content = '';
      let mimeType = '';
      let extension = '';
      
      switch (format) {
        case 'SQL':
          content = `-- Test Project Schema
CREATE TABLE [User] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(255) NOT NULL
);

-- Indexes
CREATE NONCLUSTERED INDEX [IX_User_Name] ON [User] ([name]);`;
          mimeType = 'text/sql';
          extension = '.sql';
          break;
        case 'JSON':
          content = JSON.stringify({
            project: 'Test Project',
            tables: [
              {
                name: 'User',
                columns: [
                  { name: 'id', type: 'INT', primaryKey: true },
                  { name: 'name', type: 'NVARCHAR(255)' }
                ]
              }
            ]
          }, null, 2);
          mimeType = 'application/json';
          extension = '.json';
          break;
        case 'MARKDOWN':
          content = `# Test Project Schema

## Tables

### User
- **id** (INT, PRIMARY KEY, IDENTITY)
- **name** (NVARCHAR(255), NOT NULL)

#### Indexes
- IX_User_Name (NONCLUSTERED) on name`;
          mimeType = 'text/markdown';
          extension = '.md';
          break;
        case 'HTML':
          content = `<!DOCTYPE html>
<html>
<head><title>Test Project Schema</title></head>
<body>
<h1>Test Project Schema</h1>
<h2>Tables</h2>
<h3>User</h3>
<ul>
<li><strong>id</strong> (INT, PRIMARY KEY, IDENTITY)</li>
<li><strong>name</strong> (NVARCHAR(255), NOT NULL)</li>
</ul>
</body>
</html>`;
          mimeType = 'text/html';
          extension = '.html';
          break;
        case 'CSV':
          content = `Table,Column,DataType,IsNullable,IsPrimaryKey
User,id,INT,false,true
User,name,NVARCHAR(255),false,false`;
          mimeType = 'text/csv';
          extension = '.csv';
          break;
        default:
          content = 'Unknown format';
          mimeType = 'text/plain';
          extension = '.txt';
      }
      
      return Promise.resolve({
        content,
        filename: `Test_Project${extension}`,
        mimeType,
      });
    }),
  },
  handleApiError: jest.fn().mockReturnValue({ error: 'Test error' }),
}));

// Mock other dependencies
jest.mock('../../utils/changeTracker', () => ({
  useChangeTracker: () => ({
    getState: () => ({ pendingChanges: { tables: [] } }),
    markAsSaved: jest.fn(),
  }),
}));

jest.mock('../../utils/autoSave', () => ({
  useAutoSave: () => ({
    state: { isEnabled: false, interval: 30000 },
  }),
}));

jest.mock('../../components/TableDesigner', () => ({
  TableCanvas: () => <div data-testid="table-canvas">Table Canvas</div>,
}));

jest.mock('../../components/ValidationPanel', () => ({
  ValidationDashboard: () => <div data-testid="validation-dashboard">Validation Dashboard</div>,
}));

// Mock browser APIs
beforeAll(() => {
  // Mock URL.createObjectURL and URL.revokeObjectURL
  global.URL.createObjectURL = jest.fn(() => 'mock-blob-url');
  global.URL.revokeObjectURL = jest.fn();
  
  // Mock document.createElement for download links
  const originalCreateElement = document.createElement;
  jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
    if (tagName === 'a') {
      const mockAnchor = {
        href: '',
        download: '',
        click: jest.fn(),
        style: {},
      };
      return mockAnchor as any;
    }
    return originalCreateElement.call(document, tagName);
  });
  
  // Mock document.body methods
  jest.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
  jest.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
  
  // Mock clipboard API
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn().mockResolvedValue(undefined),
    },
  });
  
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
});

describe('스키마 내보내기 UI 통합 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('프로젝트에서 스키마 내보내기 페이지로 이동할 수 있다', async () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: <App />,
      },
      {
        path: '/projects/:projectId',
        element: <App />,
      },
      {
        path: '/projects/:projectId/export',
        element: <SchemaExportPage />,
      },
    ], {
      initialEntries: ['/projects/1'],
    });

    render(<RouterProvider router={router} />);

    // 프로젝트가 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // 스키마 내보내기 링크 클릭
    const exportLink = screen.getByText('스키마 내보내기');
    fireEvent.click(exportLink);

    // 스키마 내보내기 페이지로 이동 확인
    await waitFor(() => {
      expect(screen.getByText('Test Project - 스키마 내보내기')).toBeInTheDocument();
      expect(screen.getByText('데이터베이스 스키마를 SQL 스크립트 또는 다른 형식으로 내보냅니다.')).toBeInTheDocument();
    });
  });

  it('스키마 내보내기 페이지의 모든 구성 요소가 올바르게 렌더링된다', async () => {
    const router = createMemoryRouter([
      {
        path: '/projects/:projectId/export',
        element: <SchemaExportPage />,
      },
    ], {
      initialEntries: ['/projects/1/export'],
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      // 페이지 제목
      expect(screen.getByText('Test Project - 스키마 내보내기')).toBeInTheDocument();
      
      // 메인 섹션들
      expect(screen.getByText('스키마 내보내기')).toBeInTheDocument();
      expect(screen.getByText('내보내기 옵션')).toBeInTheDocument();
      expect(screen.getByText('내보내기 기록')).toBeInTheDocument();
      expect(screen.getByText('SQL 스크립트 미리보기')).toBeInTheDocument();
      expect(screen.getByText('스키마 문서화')).toBeInTheDocument();
    });
  });

  it('스키마 검증 기능이 작동한다', async () => {
    const router = createMemoryRouter([
      {
        path: '/projects/:projectId/export',
        element: <SchemaExportPage />,
      },
    ], {
      initialEntries: ['/projects/1/export'],
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('스키마 검증')).toBeInTheDocument();
    });

    // 스키마 검증 버튼 클릭
    const validateButton = screen.getByText('스키마 검증');
    fireEvent.click(validateButton);

    // 검증 결과 확인
    await waitFor(() => {
      expect(screen.getByText('스키마가 유효합니다. 내보내기를 진행할 수 있습니다.')).toBeInTheDocument();
    });
  });

  it('다양한 출력 형식을 선택할 수 있다', async () => {
    const router = createMemoryRouter([
      {
        path: '/projects/:projectId/export',
        element: <SchemaExportPage />,
      },
    ], {
      initialEntries: ['/projects/1/export'],
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('출력 형식')).toBeInTheDocument();
    });

    // 기본적으로 SQL이 선택되어 있는지 확인
    const sqlButton = screen.getByRole('button', { name: 'SQL' });
    expect(sqlButton).toHaveClass('bg-blue-600');

    // JSON 형식 선택
    const jsonButton = screen.getByRole('button', { name: 'JSON' });
    fireEvent.click(jsonButton);

    // JSON 미리보기로 변경되는지 확인
    await waitFor(() => {
      expect(screen.getByText('JSON 미리보기')).toBeInTheDocument();
    });

    // MARKDOWN 형식 선택
    const markdownButton = screen.getByRole('button', { name: 'MARKDOWN' });
    fireEvent.click(markdownButton);

    await waitFor(() => {
      expect(screen.getByText('MARKDOWN 미리보기')).toBeInTheDocument();
    });
  });

  it('포함 옵션을 설정할 수 있다', async () => {
    const router = createMemoryRouter([
      {
        path: '/projects/:projectId/export',
        element: <SchemaExportPage />,
      },
    ], {
      initialEntries: ['/projects/1/export'],
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('포함 옵션')).toBeInTheDocument();
    });

    // 포함 옵션 체크박스들 확인
    const commentsCheckbox = screen.getByLabelText('주석 포함');
    const indexesCheckbox = screen.getByLabelText('인덱스 포함');
    const constraintsCheckbox = screen.getByLabelText('제약조건 포함');

    expect(commentsCheckbox).toBeChecked();
    expect(indexesCheckbox).toBeChecked();
    expect(constraintsCheckbox).toBeChecked();

    // 주석 포함 옵션 해제
    fireEvent.click(commentsCheckbox);
    expect(commentsCheckbox).not.toBeChecked();

    // 인덱스 포함 옵션 해제
    fireEvent.click(indexesCheckbox);
    expect(indexesCheckbox).not.toBeChecked();
  });

  it('SQL 미리보기가 올바르게 표시된다', async () => {
    const router = createMemoryRouter([
      {
        path: '/projects/:projectId/export',
        element: <SchemaExportPage />,
      },
    ], {
      initialEntries: ['/projects/1/export'],
    });

    render(<RouterProvider router={router} />);

    // SQL 미리보기 내용이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText(/CREATE TABLE \[User\]/)).toBeInTheDocument();
      expect(screen.getByText(/CREATE NONCLUSTERED INDEX/)).toBeInTheDocument();
    });

    // 복사 버튼 확인
    const copyButton = screen.getByText('복사');
    expect(copyButton).toBeInTheDocument();

    // 복사 기능 테스트
    fireEvent.click(copyButton);
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  it('파일 다운로드 기능이 작동한다', async () => {
    const router = createMemoryRouter([
      {
        path: '/projects/:projectId/export',
        element: <SchemaExportPage />,
      },
    ], {
      initialEntries: ['/projects/1/export'],
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText(/다운로드/)).toBeInTheDocument();
    });

    // 다운로드 버튼 클릭
    const downloadButton = screen.getByText(/Test_Project\.sql 다운로드/);
    fireEvent.click(downloadButton);

    // 파일 다운로드 처리 확인
    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
    });
  });

  it('스키마 문서화 기능이 작동한다', async () => {
    const router = createMemoryRouter([
      {
        path: '/projects/:projectId/export',
        element: <SchemaExportPage />,
      },
    ], {
      initialEntries: ['/projects/1/export'],
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('스키마 문서화')).toBeInTheDocument();
    });

    // 마크다운 탭이 기본으로 선택되어 있는지 확인
    const markdownTab = screen.getByRole('button', { name: '마크다운' });
    expect(markdownTab).toHaveClass('border-blue-500');

    // HTML 탭으로 전환
    const htmlTab = screen.getByRole('button', { name: 'HTML' });
    fireEvent.click(htmlTab);

    await waitFor(() => {
      expect(htmlTab).toHaveClass('border-blue-500');
    });

    // 문서화 다운로드 버튼 확인
    const docDownloadButton = screen.getAllByText('다운로드').find(button => 
      button.closest('.bg-white.rounded-lg.shadow-md')?.textContent?.includes('스키마 문서화')
    );
    expect(docDownloadButton).toBeInTheDocument();
  });

  it('내보내기 기록이 관리된다', async () => {
    const router = createMemoryRouter([
      {
        path: '/projects/:projectId/export',
        element: <SchemaExportPage />,
      },
    ], {
      initialEntries: ['/projects/1/export'],
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('내보내기 기록')).toBeInTheDocument();
    });

    // 초기에는 기록이 없음
    expect(screen.getByText('내보내기 기록이 없습니다.')).toBeInTheDocument();

    // 파일 다운로드 실행
    const downloadButton = screen.getByText(/Test_Project\.sql 다운로드/);
    fireEvent.click(downloadButton);

    // 로컬 스토리지에 기록이 저장되는지 확인
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'export_history_1',
        expect.stringContaining('Test_Project.sql')
      );
    });
  });

  it('프로젝트로 돌아가기 링크가 작동한다', async () => {
    const router = createMemoryRouter([
      {
        path: '/projects/:projectId',
        element: <App />,
      },
      {
        path: '/projects/:projectId/export',
        element: <SchemaExportPage />,
      },
    ], {
      initialEntries: ['/projects/1/export'],
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('프로젝트로 돌아가기')).toBeInTheDocument();
    });

    // 프로젝트로 돌아가기 링크 클릭
    const backLink = screen.getByText('프로젝트로 돌아가기');
    fireEvent.click(backLink);

    // 프로젝트 페이지로 이동 확인
    await waitFor(() => {
      expect(screen.getByText('프로젝트 개요')).toBeInTheDocument();
    });
  });
});

/**
 * 테스트 실행 방법:
 * 
 * 1. 단일 테스트 실행:
 *    yarn test SchemaExport.integration.test.tsx
 * 
 * 2. 모든 스키마 내보내기 통합 테스트 실행:
 *    yarn test SchemaExport.integration
 * 
 * 3. 커버리지와 함께 실행:
 *    yarn test --coverage SchemaExport.integration
 */