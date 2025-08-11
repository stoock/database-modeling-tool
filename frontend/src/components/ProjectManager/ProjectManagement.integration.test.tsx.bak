/**
 * 프로젝트 관리 UI 통합 테스트
 * 
 * 이 테스트는 다음 기능들을 검증합니다:
 * 1. 프로젝트 생성 모달 기능
 * 2. 프로젝트 목록에서 선택 및 삭제 기능
 * 3. 프로젝트 메타데이터 편집 기능
 * 4. App.tsx에서 프로젝트 선택 UI
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';

// Mock API calls
jest.mock('../../services/api', () => ({
  apiClient: {
    getProjects: jest.fn().mockResolvedValue([
      {
        id: '1',
        name: 'Test Project 1',
        description: 'First test project',
        namingRules: {
          tablePattern: '^[A-Z][a-zA-Z0-9]*$',
          columnPattern: '^[a-z][a-z0-9_]*$',
          indexPattern: '^IX_[A-Z][a-zA-Z0-9]*_[a-zA-Z0-9]+$',
          enforceCase: 'PASCAL'
        },
        tables: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Test Project 2',
        description: 'Second test project',
        namingRules: {
          tablePattern: '^[A-Z][a-zA-Z0-9]*$',
          columnPattern: '^[a-z][a-z0-9_]*$',
          indexPattern: '^IX_[A-Z][a-zA-Z0-9]*_[a-zA-Z0-9]+$',
          enforceCase: 'PASCAL'
        },
        tables: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]),
    createProject: jest.fn().mockImplementation((request) => 
      Promise.resolve({
        id: '3',
        ...request,
        tables: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ),
    updateProject: jest.fn().mockImplementation((id, request) => 
      Promise.resolve({
        id,
        ...request,
        tables: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ),
    deleteProject: jest.fn().mockResolvedValue(undefined),
    getTables: jest.fn().mockResolvedValue([]),
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

describe('프로젝트 관리 UI 통합 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('앱이 로드되면 프로젝트 목록을 표시한다', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // 로딩 상태 확인
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();

    // 프로젝트 목록이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('데이터베이스 모델링을 시작하세요')).toBeInTheDocument();
    });

    // 최근 프로젝트 섹션 확인
    expect(screen.getByText('최근 프로젝트')).toBeInTheDocument();
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('Test Project 2')).toBeInTheDocument();
  });

  it('새 프로젝트 생성 버튼을 클릭하면 모달이 열린다', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('새 프로젝트 생성')).toBeInTheDocument();
    });

    // 새 프로젝트 생성 버튼 클릭
    fireEvent.click(screen.getByText('새 프로젝트 생성'));

    // 모달이 열렸는지 확인
    await waitFor(() => {
      expect(screen.getByText('새 프로젝트 생성')).toBeInTheDocument();
      expect(screen.getByLabelText('프로젝트 이름')).toBeInTheDocument();
    });
  });

  it('프로젝트를 선택하면 메인 UI가 표시된다', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    // 프로젝트 선택
    fireEvent.click(screen.getByText('Test Project 1'));

    // 메인 UI 요소들이 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText('프로젝트 개요')).toBeInTheDocument();
      expect(screen.getByText('테이블 설계 캔버스')).toBeInTheDocument();
      expect(screen.getByTestId('table-canvas')).toBeInTheDocument();
      expect(screen.getByTestId('validation-dashboard')).toBeInTheDocument();
    });
  });

  it('프로젝트 편집 버튼을 클릭하면 편집 모달이 열린다', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    // 프로젝트 카드에 마우스 호버하여 편집 버튼 표시
    const projectCard = screen.getByText('Test Project 1').closest('.group');
    fireEvent.mouseEnter(projectCard!);

    // 편집 버튼 클릭
    const editButtons = screen.getAllByTitle('프로젝트 편집');
    fireEvent.click(editButtons[0]);

    // 편집 모달이 열렸는지 확인
    await waitFor(() => {
      expect(screen.getByText('프로젝트 편집')).toBeInTheDocument();
    });
  });

  it('프로젝트 삭제 버튼을 클릭하면 확인 다이얼로그가 표시된다', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    // 프로젝트 카드에 마우스 호버하여 삭제 버튼 표시
    const projectCard = screen.getByText('Test Project 1').closest('.group');
    fireEvent.mouseEnter(projectCard!);

    // 삭제 버튼 클릭
    const deleteButtons = screen.getAllByTitle('프로젝트 삭제');
    fireEvent.click(deleteButtons[0]);

    // 삭제 확인 다이얼로그가 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText('프로젝트 삭제')).toBeInTheDocument();
      expect(screen.getByText('이 프로젝트를 삭제하시겠습니까?')).toBeInTheDocument();
    });
  });

  it('프로젝트 선택기에서 프로젝트를 변경할 수 있다', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // 첫 번째 프로젝트 선택
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Test Project 1'));

    // 프로젝트 선택기 확인
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    // 프로젝트 선택기 드롭다운 열기
    const projectSelector = screen.getByText('Test Project 1').closest('button');
    fireEvent.click(projectSelector!);

    // 다른 프로젝트 선택
    await waitFor(() => {
      expect(screen.getByText('Test Project 2')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Test Project 2'));

    // 선택된 프로젝트가 변경되었는지 확인
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Project 2')).toBeInTheDocument();
    });
  });
});

/**
 * 테스트 실행 방법:
 * 
 * 1. 단일 테스트 실행:
 *    yarn test ProjectManagement.integration.test.tsx
 * 
 * 2. 모든 프로젝트 관리 테스트 실행:
 *    yarn test ProjectManager
 * 
 * 3. 커버리지와 함께 실행:
 *    yarn test --coverage ProjectManager
 */