import { create } from 'zustand';
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '@/types';
import apiClient from '@/lib/api';
import { useTableStore } from './tableStore';

interface ProjectStore {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  // 기본 상태 관리
  setProjects: (projects: Project[]) => void;
  setSelectedProject: (project: Project | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // CRUD 액션
  fetchProjects: () => Promise<void>;
  fetchProjectById: (id: string) => Promise<void>;
  createProject: (data: CreateProjectRequest) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  
  // 유틸리티
  clearError: () => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,
  
  // 기본 상태 관리
  setProjects: (projects) => set({ projects }),
  
  setSelectedProject: (project) => {
    set({ selectedProject: project });
    // 프로젝트 선택 시 테이블 스토어 초기화
    if (project) {
      useTableStore.getState().reset();
    }
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  // CRUD 액션
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Project[]>('/projects');
      set({ projects: response.data, isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || '프로젝트 목록을 불러오는데 실패했습니다'
        : '프로젝트 목록을 불러오는데 실패했습니다';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  fetchProjectById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Project>(`/projects/${id}`);
      set({ selectedProject: response.data, isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || '프로젝트를 불러오는데 실패했습니다'
        : '프로젝트를 불러오는데 실패했습니다';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  createProject: async (data: CreateProjectRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<Project>('/projects', data);
      const newProject = response.data;
      
      // 프로젝트 목록에 추가
      set((state) => ({
        projects: [...state.projects, newProject],
        isLoading: false,
      }));
      
      return newProject;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || '프로젝트 생성에 실패했습니다'
        : '프로젝트 생성에 실패했습니다';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  updateProject: async (id: string, data: UpdateProjectRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<Project>(`/projects/${id}`, data);
      const updatedProject = response.data;
      
      // 프로젝트 목록 업데이트
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updatedProject : p)),
        selectedProject: state.selectedProject?.id === id ? updatedProject : state.selectedProject,
        isLoading: false,
      }));
      
      return updatedProject;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || '프로젝트 수정에 실패했습니다'
        : '프로젝트 수정에 실패했습니다';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/projects/${id}`);
      
      // 프로젝트 목록에서 제거
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
        isLoading: false,
      }));
      
      // 선택된 프로젝트가 삭제된 경우 테이블 스토어도 초기화
      if (get().selectedProject?.id === id) {
        useTableStore.getState().reset();
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || '프로젝트 삭제에 실패했습니다'
        : '프로젝트 삭제에 실패했습니다';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  // 유틸리티
  clearError: () => set({ error: null }),
  
  reset: () => set({
    projects: [],
    selectedProject: null,
    isLoading: false,
    error: null,
  }),
}));
