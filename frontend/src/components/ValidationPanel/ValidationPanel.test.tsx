import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ValidationDashboard } from './ValidationDashboard';
import { ValidationResults } from './ValidationResults';
import { NamingRules } from './NamingRules';
import { ValidationGuide } from './ValidationGuide';
import { useValidationStore } from '../../stores/validationStore';
import { useProjectStore } from '../../stores/projectStore';
import { useTableStore } from '../../stores/tableStore';

// Mock stores
jest.mock('../../stores/validationStore');
jest.mock('../../stores/projectStore');
jest.mock('../../stores/tableStore');

const mockValidationStore = {
  validationResult: {
    isValid: false,
    errors: [
      {
        field: 'table:1',
        rule: 'pattern',
        message: '테이블명이 패턴에 맞지 않습니다.',
        suggestion: 'User',
      },
    ],
    warnings: [],
  },
  isValidating: false,
  error: null,
  tableValidations: {},
  columnValidations: {},
  indexValidations: {},
  validateProject: jest.fn(),
  validateTableName: jest.fn(),
  validateColumnName: jest.fn(),
  validateIndexName: jest.fn(),
  validateTable: jest.fn(),
  validateColumn: jest.fn(),
  validateIndex: jest.fn(),
  setTableValidation: jest.fn(),
  setColumnValidation: jest.fn(),
  setIndexValidation: jest.fn(),
  clearValidations: jest.fn(),
  clearError: jest.fn(),
};

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
    tables: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  updateNamingRules: jest.fn(),
};

const mockTableStore = {
  tables: [
    {
      id: '1',
      projectId: '1',
      name: 'user',
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
      ],
      indexes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

describe('ValidationPanel Components', () => {
  beforeEach(() => {
    (useValidationStore as jest.Mock).mockReturnValue(mockValidationStore);
    (useProjectStore as jest.Mock).mockReturnValue(mockProjectStore);
    (useTableStore as jest.Mock).mockReturnValue(mockTableStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ValidationDashboard', () => {
    it('검증 대시보드가 올바르게 렌더링된다', () => {
      render(<ValidationDashboard projectId="1" />);

      expect(screen.getByText('스키마 검증')).toBeInTheDocument();
      expect(screen.getByText('검증 결과')).toBeInTheDocument();
      expect(screen.getByText('네이밍 규칙 설정')).toBeInTheDocument();
      expect(screen.getByText('해결 가이드')).toBeInTheDocument();
    });

    it('탭을 클릭하면 해당 컨텐츠가 표시된다', async () => {
      render(<ValidationDashboard projectId="1" />);

      // 네이밍 규칙 설정 탭 클릭
      fireEvent.click(screen.getByText('네이밍 규칙 설정'));
      await waitFor(() => {
        expect(screen.getByText('네이밍 규칙 설정')).toBeInTheDocument();
      });

      // 해결 가이드 탭 클릭
      fireEvent.click(screen.getByText('해결 가이드'));
      await waitFor(() => {
        expect(screen.getByText('검증 오류 해결 가이드')).toBeInTheDocument();
      });
    });

    it('자동 새로고침을 설정할 수 있다', () => {
      render(<ValidationDashboard projectId="1" />);

      const autoRefreshCheckbox = screen.getByLabelText('자동 새로고침');
      expect(autoRefreshCheckbox).not.toBeChecked();

      fireEvent.click(autoRefreshCheckbox);
      expect(autoRefreshCheckbox).toBeChecked();
    });

    it('지금 검증 버튼을 클릭하면 검증이 실행된다', () => {
      render(<ValidationDashboard projectId="1" />);

      const validateButton = screen.getByText('지금 검증');
      fireEvent.click(validateButton);

      expect(mockValidationStore.validateProject).toHaveBeenCalledWith('1');
    });
  });

  describe('ValidationResults', () => {
    it('검증 결과가 올바르게 표시된다', () => {
      render(<ValidationResults projectId="1" />);

      expect(screen.getByText('검증 결과')).toBeInTheDocument();
      expect(screen.getByText('총 검증 항목')).toBeInTheDocument();
      expect(screen.getByText('오류')).toBeInTheDocument();
      expect(screen.getByText('경고')).toBeInTheDocument();
    });

    it('오류 목록이 표시된다', () => {
      render(<ValidationResults projectId="1" />);

      expect(screen.getByText('오류 목록')).toBeInTheDocument();
      expect(screen.getByText('테이블명이 패턴에 맞지 않습니다.')).toBeInTheDocument();
    });

    it('제안을 표시하고 적용할 수 있다', async () => {
      render(<ValidationResults projectId="1" />);

      // 제안 보기 버튼 클릭
      const showSuggestionButton = screen.getByText('제안 보기');
      fireEvent.click(showSuggestionButton);

      await waitFor(() => {
        expect(screen.getByText('User')).toBeInTheDocument();
        expect(screen.getByText('이 제안 적용하기')).toBeInTheDocument();
      });
    });
  });

  describe('NamingRules', () => {
    it('네이밍 규칙 설정 폼이 올바르게 렌더링된다', () => {
      render(<NamingRules projectId="1" />);

      expect(screen.getByText('네이밍 규칙 설정')).toBeInTheDocument();
      expect(screen.getByLabelText('테이블 접두사')).toBeInTheDocument();
      expect(screen.getByLabelText('테이블 접미사')).toBeInTheDocument();
      expect(screen.getByLabelText('테이블 이름 패턴 (정규식)')).toBeInTheDocument();
      expect(screen.getByLabelText('컬럼 이름 패턴 (정규식)')).toBeInTheDocument();
      expect(screen.getByLabelText('인덱스 이름 패턴 (정규식)')).toBeInTheDocument();
      expect(screen.getByLabelText('케이스 강제 적용')).toBeInTheDocument();
    });

    it('현재 프로젝트의 네이밍 규칙으로 폼이 초기화된다', () => {
      render(<NamingRules projectId="1" />);

      const tablePatternInput = screen.getByDisplayValue('^[A-Z][a-zA-Z0-9]*$');
      const columnPatternInput = screen.getByDisplayValue('^[a-z][a-z0-9_]*$');
      const indexPatternInput = screen.getByDisplayValue('^IX_[A-Z][a-zA-Z0-9]*_[a-zA-Z0-9]+$');

      expect(tablePatternInput).toBeInTheDocument();
      expect(columnPatternInput).toBeInTheDocument();
      expect(indexPatternInput).toBeInTheDocument();
    });

    it('네이밍 규칙을 저장할 수 있다', async () => {
      render(<NamingRules projectId="1" />);

      const saveButton = screen.getByText('네이밍 규칙 저장');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockProjectStore.updateNamingRules).toHaveBeenCalled();
      });
    });
  });

  describe('ValidationGuide', () => {
    it('검증 가이드가 올바르게 렌더링된다', () => {
      render(<ValidationGuide />);

      expect(screen.getByText('검증 오류 해결 가이드')).toBeInTheDocument();
      expect(screen.getByText('현재 프로젝트의 네이밍 규칙에 따른 올바른 명명 방법을 확인하세요.')).toBeInTheDocument();
    });

    it('가이드 섹션을 확장하고 축소할 수 있다', async () => {
      render(<ValidationGuide />);

      const tableNamingSection = screen.getByText('테이블 네이밍 규칙');
      fireEvent.click(tableNamingSection);

      await waitFor(() => {
        expect(screen.getByText('올바른 예시')).toBeInTheDocument();
        expect(screen.getByText('잘못된 예시')).toBeInTheDocument();
        expect(screen.getByText('유용한 팁')).toBeInTheDocument();
      });
    });

    it('네이밍 규칙이 없으면 안내 메시지를 표시한다', () => {
      (useProjectStore as jest.Mock).mockReturnValue({
        ...mockProjectStore,
        currentProject: {
          ...mockProjectStore.currentProject,
          namingRules: {},
        },
      });

      render(<ValidationGuide />);

      expect(screen.getByText('네이밍 규칙이 설정되지 않았습니다')).toBeInTheDocument();
      expect(screen.getByText('네이밍 규칙을 설정하면 여기에 가이드가 표시됩니다.')).toBeInTheDocument();
    });
  });
});

/**
 * 테스트 실행 방법:
 * 
 * 1. 단일 테스트 실행:
 *    yarn test ValidationPanel.test.tsx
 * 
 * 2. 모든 검증 패널 테스트 실행:
 *    yarn test ValidationPanel
 * 
 * 3. 커버리지와 함께 실행:
 *    yarn test --coverage ValidationPanel
 */