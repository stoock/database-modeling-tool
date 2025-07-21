import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
  Project, 
  CreateProjectRequest, 
  UpdateProjectRequest,
  NamingRules 
} from '../types';
import { apiClient, handleApiError } from '../services/api';

interface ProjectState {
  // 상태
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  // 액션
  loadProjects: () => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  createProject: (request: CreateProjectRequest) => Promise<Project | null>;
  updateProject: (id: string, request: UpdateProjectRequest) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  setCurrentProject: (project: Project | null) => void;
  updateNamingRules: (namingRules: NamingRules) => Promise<void>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    immer((set, get) => ({
      // 초기 상태
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,

      // 프로젝트 목록 로드
      loadProjects: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const projects = await apiClient.getProjects();
          set((state) => {
            state.projects = projects;
            state.isLoading = false;
          });
        } catch (error) {
          const apiError = handleApiError(error);
          set((state) => {
            state.error = apiError.error;
            state.isLoading = false;
          });
        }
      },

      // 특정 프로젝트 로드
      loadProject: async (id: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const project = await apiClient.getProject(id);
          set((state) => {
            state.currentProject = project;
            state.isLoading = false;
          });
        } catch (error) {
          const apiError = handleApiError(error);
          set((state) => {
            state.error = apiError.error;
            state.isLoading = false;
          });
        }
      },

      // 프로젝트 생성
      createProject: async (request: CreateProjectRequest) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const newProject = await apiClient.createProject(request);
          set((state) => {
            state.projects.push(newProject);
            state.currentProject = newProject;
            state.isLoading = false;
          });
          return newProject;
        } catch (error) {
          const apiError = handleApiError(error);
          set((state) => {
            state.error = apiError.error;
            state.isLoading = false;
          });
          return null;
        }
      },

      // 프로젝트 업데이트
      updateProject: async (id: string, request: UpdateProjectRequest) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const updatedProject = await apiClient.updateProject(id, request);
          set((state) => {
            const index = state.projects.findIndex(p => p.id === id);
            if (index !== -1) {
              state.projects[index] = updatedProject;
            }
            if (state.currentProject?.id === id) {
              state.currentProject = updatedProject;
            }
            state.isLoading = false;
          });
          return updatedProject;
        } catch (error) {
          const apiError = handleApiError(error);
          set((state) => {
            state.error = apiError.error;
            state.isLoading = false;
          });
          return null;
        }
      },

      // 프로젝트 삭제
      deleteProject: async (id: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          await apiClient.deleteProject(id);
          set((state) => {
            state.projects = state.projects.filter(p => p.id !== id);
            if (state.currentProject?.id === id) {
              state.currentProject = null;
            }
            state.isLoading = false;
          });
          return true;
        } catch (error) {
          const apiError = handleApiError(error);
          set((state) => {
            state.error = apiError.error;
            state.isLoading = false;
          });
          return false;
        }
      },

      // 현재 프로젝트 설정
      setCurrentProject: (project: Project | null) => {
        set((state) => {
          state.currentProject = project;
        });
      },

      // 네이밍 규칙 업데이트
      updateNamingRules: async (namingRules: NamingRules) => {
        const { currentProject } = get();
        if (!currentProject) return;

        const updatedProject = await get().updateProject(currentProject.id, { namingRules });
        if (updatedProject) {
          set((state) => {
            state.currentProject = updatedProject;
          });
        }
      },

      // 에러 클리어
      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },
    })),
    {
      name: 'project-store',
    }
  )
);