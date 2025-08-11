import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../../App'

// Mock the stores
vi.mock('../../stores/projectStore', () => ({
  useProjectStore: () => ({
    projects: [],
    currentProject: null,
    loadProjects: vi.fn(),
    loadProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    setCurrentProject: vi.fn(),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  }),
}))

vi.mock('../../stores/tableStore', () => ({
  useTableStore: () => ({
    tables: [],
    loadTables: vi.fn(),
    updateTable: vi.fn(),
  }),
}))

vi.mock('../../stores/validationStore', () => ({
  useValidationStore: () => ({
    clearValidations: vi.fn(),
  }),
}))

// Mock the utils
vi.mock('../../utils/changeTracker', () => ({
  useChangeTracker: () => ({
    getState: () => ({ pendingChanges: { tables: [] } }),
    markAsSaved: vi.fn(),
  }),
}))

vi.mock('../../utils/autoSave', () => ({
  useAutoSave: () => ({
    state: { isEnabled: false, interval: 0 },
  }),
}))

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    expect(screen.getByText('MSSQL 데이터베이스 모델링 도구')).toBeInTheDocument()
  })

  it('shows project selection message when no project is selected', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    expect(screen.getByText('데이터베이스 모델링을 시작하세요')).toBeInTheDocument()
  })
})