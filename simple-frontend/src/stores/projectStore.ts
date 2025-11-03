/**
 * 프로젝트 상태 관리 스토어
 */

import { create } from 'zustand';
import { projectService } from '../services/projectService';
import type {
  Project,
  ProjectSummary,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../types/project';

interface ProjectStore {
  // 상태
  projects: ProjectSummary[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;

  // 액션
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: CreateProjectRequest) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  // 초기 상태
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  // 프로젝트 목록 조회
  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await projectService.getAll();
      set({ projects, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '프로젝트 목록 조회 실패',
        loading: false,
      });
    }
  },

  // 프로젝트 상세 조회
  fetchProject: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const project = await projectService.getById(id);
      set({ currentProject: project, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '프로젝트 조회 실패',
        loading: false,
      });
    }
  },

  // 프로젝트 생성
  createProject: async (data: CreateProjectRequest) => {
    set({ loading: true, error: null });
    try {
      const project = await projectService.create(data);
      set((state) => ({
        projects: [...state.projects, { ...project, tableCount: 0 }],
        loading: false,
      }));
      return project;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '프로젝트 생성 실패',
        loading: false,
      });
      throw error;
    }
  },

  // 프로젝트 수정
  updateProject: async (id: string, data: UpdateProjectRequest) => {
    set({ loading: true, error: null });
    try {
      const project = await projectService.update(id, data);
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, ...data } : p
        ),
        currentProject: state.currentProject?.id === id ? project : state.currentProject,
        loading: false,
      }));
      return project;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '프로젝트 수정 실패',
        loading: false,
      });
      throw error;
    }
  },

  // 프로젝트 삭제
  deleteProject: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await projectService.delete(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '프로젝트 삭제 실패',
        loading: false,
      });
      throw error;
    }
  },

  // 에러 초기화
  clearError: () => set({ error: null }),
}));
