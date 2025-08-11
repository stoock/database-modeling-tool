import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SchemaExportPage from '../../pages/SchemaExportPage';
import { SchemaExportPanel } from './SchemaExportPanel';
import { ExportOptions } from './ExportOptions';
import { SqlPreview } from './SqlPreview';
import { ExportHistory } from './ExportHistory';
import { useProjectStore } from '../../stores/projectStore';
import { useValidationStore } from '../../stores/validationStore';

// Mock stores
jest.mock('../../stores/projectStore');
jest.mock('../../stores/validationStore');

// Mock API
jest.mock('../../services/api', () => ({
  apiClient: {
    exportSchema: jest.fn().mockResolvedValue({
      content: 'CREATE TABLE User (id INT PRIMARY KEY, name NVARCHAR(255));',
      filename: 'test_schema.sql',
      mimeType: 'text/sql',
    }),
  },
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ projectId: '1' }),
  useNavigate: () => jest.fn(),
}));

const mockProjectStore = {
  currentProject: {
    id: '1',
    name: 'Test Project',
    description: 'Test Description',
    namingRules: {
      tablePattern: '^[A-Z][a-zA-Z0-9]*$',
      columnPattern: '^[a-z][a-z0-9_]*$',
      indexPattern: '^IX_[A-Z][a-zA-Z0-9]*_[a-zA-Z0-9]+$',
      enforceCase: 'PASCAL' as const,
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
            dataType: 'INT' as const,
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
            dataType: 'NVARCHAR' as const,
            maxLength: 255,
            isNullable: false,
            isPrimaryKey: false,
            isIdentity: false,
            orderIndex: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        indexes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  loadProject: jest.fn(),
  isLoading: false,
  error: null,
};

const mockValidationStore = {
  validateProject: jest.fn().mockResolvedValue({
    isValid: true,
    errors: [],
    warnings: [],
  }),
};

describe('SchemaExport Components', () => {
  beforeEach(() => {
    (useProjectStore as jest.Mock).mockReturnValue(mockProjectStore);
    (useValidationStore as jest.Mock).mockReturnValue(mockValidationStore);
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
    
    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock document.createElement
    const mockAnchor = {
      href: '',
      download: '',
      click: jest.fn(),
    };
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockAnchor as any;
      }
      return document.createElement(tagName);
    });
    
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('SchemaExportPage', () => {
    it('스키마 내보내기 페이지가 올바르게 렌더링된다', async () => {
      render(
        <BrowserRouter>
          <SchemaExportPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Project - 스키마 내보내기')).toBeInTheDocument();
        expect(screen.getByText('데이터베이스 스키마를 SQL 스크립트 또는 다른 형식으로 내보냅니다.')).toBeInTheDocument();
      });
    });

    it('프로젝트가 없으면 오류 메시지를 표시한다', async () => {
      (useProjectStore as jest.Mock).mockReturnValue({
        ...mockProjectStore,
        currentProject: null,
      });

      render(
        <BrowserRouter>
          <SchemaExportPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('프로젝트를 찾을 수 없습니다')).toBeInTheDocument();
      });
    });
  });

  describe('SchemaExportPanel', () => {
    it('스키마 내보내기 패널이 올바르게 렌더링된다', () => {
      render(<SchemaExportPanel />);

      expect(screen.getByText('스키마 내보내기')).toBeInTheDocument();
      expect(screen.getByText('스키마 검증')).toBeInTheDocument();
      expect(screen.getByText('내보내기 옵션')).toBeInTheDocument();
      expect(screen.getByText('내보내기 기록')).toBeInTheDocument();
    });

    it('스키마 검증 버튼을 클릭하면 검증이 실행된다', async () => {
      render(<SchemaExportPanel />);

      const validateButton = screen.getByText('스키마 검증');
      fireEvent.click(validateButton);

      await waitFor(() => {
        expect(mockValidationStore.validateProject).toHaveBeenCalledWith('1');
      });
    });

    it('검증 결과가 표시된다', async () => {
      render(<SchemaExportPanel />);

      const validateButton = screen.getByText('스키마 검증');
      fireEvent.click(validateButton);

      await waitFor(() => {
        expect(screen.getByText('스키마가 유효합니다. 내보내기를 진행할 수 있습니다.')).toBeInTheDocument();
      });
    });
  });

  describe('ExportOptions', () => {
    const mockOnOptionsChange = jest.fn();
    const mockOnExportComplete = jest.fn();

    it('내보내기 옵션이 올바르게 렌더링된다', () => {
      render(
        <ExportOptions
          projectId="1"
          onOptionsChange={mockOnOptionsChange}
          onExportComplete={mockOnExportComplete}
        />
      );

      expect(screen.getByText('내보내기 옵션')).toBeInTheDocument();
      expect(screen.getByText('출력 형식')).toBeInTheDocument();
      expect(screen.getByText('포함 옵션')).toBeInTheDocument();
      
      // 출력 형식 버튼들
      expect(screen.getByText('SQL')).toBeInTheDocument();
      expect(screen.getByText('MARKDOWN')).toBeInTheDocument();
      expect(screen.getByText('HTML')).toBeInTheDocument();
      expect(screen.getByText('JSON')).toBeInTheDocument();
      expect(screen.getByText('CSV')).toBeInTheDocument();
      
      // 포함 옵션 체크박스들
      expect(screen.getByLabelText('주석 포함')).toBeInTheDocument();
      expect(screen.getByLabelText('인덱스 포함')).toBeInTheDocument();
      expect(screen.getByLabelText('제약조건 포함')).toBeInTheDocument();
    });

    it('출력 형식을 변경할 수 있다', async () => {
      render(
        <ExportOptions
          projectId="1"
          onOptionsChange={mockOnOptionsChange}
          onExportComplete={mockOnExportComplete}
        />
      );

      const jsonButton = screen.getByText('JSON');
      fireEvent.click(jsonButton);

      await waitFor(() => {
        expect(mockOnOptionsChange).toHaveBeenCalledWith({
          format: 'JSON',
          includeComments: true,
          includeIndexes: true,
          includeConstraints: true,
        });
      });
    });

    it('포함 옵션을 변경할 수 있다', async () => {
      render(
        <ExportOptions
          projectId="1"
          onOptionsChange={mockOnOptionsChange}
          onExportComplete={mockOnExportComplete}
        />
      );

      const commentsCheckbox = screen.getByLabelText('주석 포함');
      fireEvent.click(commentsCheckbox);

      await waitFor(() => {
        expect(mockOnOptionsChange).toHaveBeenCalledWith({
          format: 'SQL',
          includeComments: false,
          includeIndexes: true,
          includeConstraints: true,
        });
      });
    });

    it('다운로드 버튼을 클릭하면 파일이 다운로드된다', async () => {
      render(
        <ExportOptions
          projectId="1"
          onOptionsChange={mockOnOptionsChange}
          onExportComplete={mockOnExportComplete}
        />
      );

      const downloadButton = screen.getByText(/다운로드/);
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockOnExportComplete).toHaveBeenCalledWith({
          content: 'CREATE TABLE User (id INT PRIMARY KEY, name NVARCHAR(255));',
          filename: 'test_schema.sql',
          mimeType: 'text/sql',
        });
      });
    });
  });

  describe('SqlPreview', () => {
    it('SQL 미리보기가 올바르게 렌더링된다', async () => {
      render(
        <SqlPreview
          projectId="1"
          format="SQL"
          includeComments={true}
          includeIndexes={true}
          includeConstraints={true}
        />
      );

      expect(screen.getByText('SQL 스크립트 미리보기')).toBeInTheDocument();
      expect(screen.getByText('복사')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/CREATE TABLE User/)).toBeInTheDocument();
      });
    });

    it('다른 형식의 미리보기도 표시할 수 있다', async () => {
      render(
        <SqlPreview
          projectId="1"
          format="JSON"
          includeComments={true}
          includeIndexes={true}
          includeConstraints={true}
        />
      );

      expect(screen.getByText('JSON 미리보기')).toBeInTheDocument();
    });

    it('복사 버튼을 클릭하면 클립보드에 복사된다', async () => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });

      render(
        <SqlPreview
          projectId="1"
          format="SQL"
          includeComments={true}
          includeIndexes={true}
          includeConstraints={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/CREATE TABLE User/)).toBeInTheDocument();
      });

      const copyButton = screen.getByText('복사');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          'CREATE TABLE User (id INT PRIMARY KEY, name NVARCHAR(255));'
        );
      });
    });
  });

  describe('ExportHistory', () => {
    it('내보내기 기록이 올바르게 렌더링된다', () => {
      render(<ExportHistory projectId="1" />);

      expect(screen.getByText('내보내기 기록')).toBeInTheDocument();
      expect(screen.getByText('내보내기 기록이 없습니다.')).toBeInTheDocument();
    });

    it('기록이 있으면 목록을 표시한다', () => {
      // Mock localStorage with history
      const mockHistory = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          format: 'SQL',
          filename: 'test_schema.sql',
          content: 'CREATE TABLE User...',
          mimeType: 'text/sql',
        },
      ];

      (window.localStorage.getItem as jest.Mock).mockReturnValue(
        JSON.stringify(mockHistory)
      );

      render(<ExportHistory projectId="1" />);

      expect(screen.getByText('test_schema.sql')).toBeInTheDocument();
      expect(screen.getByText('SQL')).toBeInTheDocument();
    });
  });
});

/**
 * 테스트 실행 방법:
 * 
 * 1. 단일 테스트 실행:
 *    yarn test SchemaExport.test.tsx
 * 
 * 2. 모든 스키마 내보내기 테스트 실행:
 *    yarn test SchemaExport
 * 
 * 3. 커버리지와 함께 실행:
 *    yarn test --coverage SchemaExport
 */