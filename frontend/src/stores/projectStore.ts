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
import { useToastStore } from './toastStore';

interface ProjectState {
  // 상태
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  hasReachedMaxRetries: boolean;
  isRetrying: boolean;

  // 액션
  loadProjects: () => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  retryLoadProjects: () => Promise<void>;
  createProject: (request: CreateProjectRequest) => Promise<Project | null>;
  updateProject: (id: string, request: UpdateProjectRequest) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  setCurrentProject: (project: Project | null) => void;
  updateNamingRules: (namingRules: NamingRules) => Promise<void>;
  clearError: () => void;
  resetRetryState: () => void;
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    immer((set, get) => ({
      // 초기 상태
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,
      retryCount: 0,
      hasReachedMaxRetries: false,
      isRetrying: false,

      // 프로젝트 목록 로드 (재시도 로직 포함)
      loadProjects: async () => {
        const state = get();
        
        // 이미 로딩 중이거나 재시도 중이면 중복 호출 방지
        if (state.isLoading || state.isRetrying) {
          console.log('프로젝트 로드가 이미 진행 중입니다.');
          return;
        }

        const MAX_RETRIES = 3;
        const DELAY_MS = 1000;
        const BACKOFF_MULTIPLIER = 2;

        const attemptLoad = async (attempt: number): Promise<void> => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
            state.retryCount = attempt;
            state.hasReachedMaxRetries = false;
            state.isRetrying = attempt > 1;
          });

          try {
            const projects = await apiClient.getProjects();
            set((state) => {
              state.projects = projects;
              state.isLoading = false;
              state.error = null;
              state.retryCount = 0;
              state.hasReachedMaxRetries = false;
              state.isRetrying = false;
            });

            // 재시도 후 성공 시 토스트 알림
            if (attempt > 1) {
              const { success } = useToastStore.getState();
              success(
                '프로젝트 목록 로드 성공',
                `${attempt}회 시도 후 성공적으로 불러왔습니다.`,
                3000
              );
            }
          } catch (error) {
            handleApiError(error);
            
            if (attempt >= MAX_RETRIES) {
              const finalError = `프로젝트 목록을 불러오는데 실패했습니다. (${MAX_RETRIES}회 재시도 완료)`;
              set((state) => {
                state.error = finalError;
                state.isLoading = false;
                state.retryCount = attempt;
                state.hasReachedMaxRetries = true;
                state.isRetrying = false;
              });

              // 최종 실패 시 토스트 알림
              const { error: showErrorToast } = useToastStore.getState();
              showErrorToast(
                '프로젝트 목록 로드 실패',
                `네트워크 연결을 확인하고 다시 시도해주세요. (${attempt}회 시도 완료)`,
                8000
              );
              return;
            }

            // 재시도 전 딜레이 - 무한루프 방지를 위해 setTimeout 대신 Promise 사용
            const delay = DELAY_MS * Math.pow(BACKOFF_MULTIPLIER, attempt - 1);
            
            set((state) => {
              state.error = `프로젝트 목록 로드 중... (${attempt}/${MAX_RETRIES}회 시도)`;
              state.retryCount = attempt;
            });

            // setTimeout 대신 Promise를 사용하여 더 안전한 비동기 처리
            await new Promise(resolve => setTimeout(resolve, delay));
            return attemptLoad(attempt + 1);
          }
        };

        await attemptLoad(1);
      },

      // 수동 재시도
      retryLoadProjects: async () => {
        const { hasReachedMaxRetries } = get();
        if (hasReachedMaxRetries) {
          const { info } = useToastStore.getState();
          info('재시도 중...', '프로젝트 목록을 다시 불러오고 있습니다.', 2000);
          
          set((state) => {
            state.retryCount = 0;
            state.hasReachedMaxRetries = false;
            state.error = null;
          });
          await get().loadProjects();
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

      // 재시도 상태 초기화
      resetRetryState: () => {
        set((state) => {
          state.retryCount = 0;
          state.hasReachedMaxRetries = false;
          state.error = null;
          state.isRetrying = false;
        });
      },
    })),
    {
      name: 'project-store',
    }
  )
);