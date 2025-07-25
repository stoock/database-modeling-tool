import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProjectCreateModal } from './ProjectCreateModal';
import { ProjectSelector } from './ProjectSelector';
import { useProjectStore } from '../../stores/projectStore';

// Mock the project store
jest.mock('../../stores/projectStore');
const mockUseProjectStore = useProjectStore as jest.MockedFunction<typeof useProjectStore>;

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: jest.fn((fn) => fn),
    formState: { errors: {} },
    reset: jest.fn(),
    setValue: jest.fn(),
  }),
}));

// Mock common components
jest.mock('../common', () => ({
  Modal: ({ children, isOpen, title }: any) => 
    isOpen ? <div data-testid="modal"><h1>{title}</h1>{children}</div> : null,
  Button: ({ children, onClick, type }: any) => 
    <button onClick={onClick} type={type}>{children}</button>,
  Input: ({ label, ...props }: any) => 
    <div><label>{label}</label><input {...props} /></div>,
  ErrorMessage: ({ message }: any) => <div data-testid="error">{message}</div>,
}));

const mockProjectStore = {
  projects: [
    {
      id: '1',
      name: 'Test Project',
      description: 'Test Description',
      namingRules: {},
      tables: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  currentProject: null,
  isLoading: false,
  error: null,
  createProject: jest.fn(),
  updateProject: jest.fn(),
  deleteProject: jest.fn(),
  setCurrentProject: jest.fn(),
  loadProjects: jest.fn(),
  loadProject: jest.fn(),
  updateNamingRules: jest.fn(),
  clearError: jest.fn(),
};

describe('ProjectManager Components', () => {
  beforeEach(() => {
    mockUseProjectStore.mockReturnValue(mockProjectStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ProjectCreateModal', () => {
    it('프로젝트 생성 모달이 올바르게 렌더링된다', () => {
      render(
        <ProjectCreateModal
          isOpen={true}
          onClose={jest.fn()}
          onSuccess={jest.fn()}
        />
      );

      expect(screen.getByText('새 프로젝트 생성')).toBeInTheDocument();
      expect(screen.getByLabelText('프로젝트 이름')).toBeInTheDocument();
      expect(screen.getByText('생성')).toBeInTheDocument();
      expect(screen.getByText('취소')).toBeInTheDocument();
    });

    it('편집 모드에서 올바른 제목을 표시한다', () => {
      const project = mockProjectStore.projects[0];
      
      render(
        <ProjectCreateModal
          isOpen={true}
          onClose={jest.fn()}
          project={project}
          onSuccess={jest.fn()}
        />
      );

      expect(screen.getByText('프로젝트 편집')).toBeInTheDocument();
      expect(screen.getByText('수정')).toBeInTheDocument();
    });

    it('모달이 닫혀있을 때 렌더링되지 않는다', () => {
      render(
        <ProjectCreateModal
          isOpen={false}
          onClose={jest.fn()}
          onSuccess={jest.fn()}
        />
      );

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  describe('ProjectSelector', () => {
    it('프로젝트 선택기가 올바르게 렌더링된다', () => {
      render(
        <BrowserRouter>
          <ProjectSelector />
        </BrowserRouter>
      );

      expect(screen.getByText('프로젝트를 선택하세요')).toBeInTheDocument();
    });

    it('현재 프로젝트가 선택되어 있을 때 프로젝트 이름을 표시한다', () => {
      const storeWithCurrentProject = {
        ...mockProjectStore,
        currentProject: mockProjectStore.projects[0],
      };
      
      mockUseProjectStore.mockReturnValue(storeWithCurrentProject);

      render(
        <BrowserRouter>
          <ProjectSelector />
        </BrowserRouter>
      );

      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('로딩 중일 때 스켈레톤을 표시한다', () => {
      const loadingStore = {
        ...mockProjectStore,
        isLoading: true,
        projects: [],
      };
      
      mockUseProjectStore.mockReturnValue(loadingStore);

      render(
        <BrowserRouter>
          <ProjectSelector />
        </BrowserRouter>
      );

      expect(screen.getByRole('button')).toHaveClass('animate-pulse');
    });
  });
});