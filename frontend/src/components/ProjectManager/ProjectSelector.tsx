import React, { useState } from 'react';
import { ChevronDownIcon, PlusIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { useProjectStore } from '../../stores/projectStore';
import { ProjectCreateModal } from './ProjectCreateModal';
import Button from '../common/Button';
import type { Project } from '../../types';

interface ProjectSelectorProps {
  onProjectSelect?: (project: Project) => void;
  onProjectSettings?: (project: Project) => void;
  className?: string;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  onProjectSelect,
  onProjectSettings,
  className = ''
}) => {
  const { 
    projects, 
    currentProject, 
    setCurrentProject, 
    isLoading,
    error,
    hasReachedMaxRetries,
    retryLoadProjects,
    resetRetryState
  } = useProjectStore();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // 컴포넌트 마운트 시 프로젝트 목록 로드 - DashboardMain에서 이미 호출하므로 제거
  // useEffect(() => {
  //   loadProjects();
  // }, [loadProjects]);

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    onProjectSelect?.(project);
  };

  const handleProjectEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleProjectSettings = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    onProjectSettings?.(project);
  };

  const handleCreateSuccess = (project: Project) => {
    setCurrentProject(project);
    onProjectSelect?.(project);
  };

  const handleEditSuccess = (project: Project) => {
    // 현재 선택된 프로젝트가 편집된 프로젝트라면 업데이트
    if (currentProject?.id === project.id) {
      setCurrentProject(project);
    }
  };

  const handleRetry = () => {
    resetRetryState();
    retryLoadProjects();
  };

  if (isLoading && projects.length === 0) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-gray-200 rounded-md"></div>
      </div>
    );
  }

  // 에러 상태 처리
  if (hasReachedMaxRetries && error && projects.length === 0) {
    return (
      <div className={className}>
        <Button
          onClick={handleRetry}
          variant="danger"
          className="w-full justify-between border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
          title={error}
        >
          <div className="flex items-center min-w-0 flex-1">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="truncate">불러오기 실패 - 다시 시도</span>
          </div>
          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className={`relative ${className}`}>
        <Menu as="div" className="relative inline-block text-left w-full">
          <div>
            <Menu.Button className="inline-flex w-full justify-between items-center rounded-xl border-2 border-surface-300 bg-gradient-to-r from-white to-surface-50 px-4 py-3 text-sm font-semibold text-surface-800 shadow-soft hover:from-surface-50 hover:to-surface-100 hover:border-surface-400 hover:shadow-medium hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-primary-200 transition-all duration-200">
              <div className="flex items-center min-w-0 flex-1">
                {currentProject ? (
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-surface-900 truncate">
                      {currentProject.name}
                    </div>
                    {currentProject.description && (
                      <div className="text-xs text-surface-600 truncate">
                        {currentProject.description}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-surface-600 font-medium">프로젝트를 선택하세요</span>
                )}
              </div>
              <ChevronDownIcon className="ml-2 h-5 w-5 text-surface-500" aria-hidden="true" />
            </Menu.Button>
          </div>

          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-3 w-full origin-top-right rounded-xl bg-gradient-to-br from-white to-surface-50 shadow-strong ring-1 ring-surface-200 ring-opacity-50 focus:outline-none border border-surface-200/50 backdrop-blur-sm">
              <div className="py-2">
                {/* 새 프로젝트 생성 */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className={`${
                        active ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-800 border-l-4 border-primary-400' : 'text-surface-700'
                      } group flex w-full items-center px-4 py-3 text-sm font-semibold transition-all duration-200 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100`}
                    >
                      <PlusIcon className={`mr-3 h-5 w-5 ${active ? 'text-primary-600' : 'text-surface-500'} group-hover:text-primary-600 transition-colors`} strokeWidth={2.5} />
                      새 프로젝트 생성
                    </button>
                  )}
                </Menu.Item>

                {projects.length > 0 && (
                  <>
                    <div className="border-t border-surface-200 my-2 mx-2"></div>
                    
                    {/* 프로젝트 목록 */}
                    <div className="max-h-60 overflow-y-auto">
                      {projects.map((project) => (
                        <Menu.Item key={project.id}>
                          {({ active }) => (
                            <div
                              className={`${
                                active ? 'bg-gradient-to-r from-surface-50 to-surface-100' : ''
                              } ${
                                currentProject?.id === project.id ? 'bg-gradient-to-r from-primary-50 to-primary-100 border-l-4 border-primary-400' : ''
                              } group flex items-center justify-between px-4 py-3 text-sm cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-surface-50 hover:to-surface-100`}
                              onClick={() => handleProjectSelect(project)}
                            >
                              <div className="min-w-0 flex-1">
                                <div className={`font-bold truncate ${
                                  currentProject?.id === project.id 
                                    ? 'text-primary-800' 
                                    : 'text-surface-800'
                                }`}>
                                  {project.name}
                                </div>
                                {project.description && (
                                  <div className="text-xs text-surface-600 truncate">
                                    {project.description}
                                  </div>
                                )}
                                <div className="text-xs text-surface-500 mt-1 font-medium">
                                  테이블 {project.tables?.length || 0}개
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 opacity-60 group-hover:opacity-100 transition-all duration-300">
                                <button
                                  onClick={(e) => handleProjectEdit(project, e)}
                                  className="p-2 bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 hover:from-primary-200 hover:to-primary-300 hover:text-primary-800 rounded-lg border border-primary-200 hover:border-primary-300 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                                  title="프로젝트 편집"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                
                                {onProjectSettings && (
                                  <button
                                    onClick={(e) => handleProjectSettings(project, e)}
                                    className="p-2 bg-gradient-to-r from-surface-100 to-surface-200 text-surface-700 hover:from-surface-200 hover:to-surface-300 hover:text-surface-800 rounded-lg border border-surface-200 hover:border-surface-300 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                                    title="프로젝트 설정"
                                  >
                                    <Cog6ToothIcon className="w-4 h-4" strokeWidth={2.5} />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      {/* 프로젝트 생성 모달 */}
      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* 프로젝트 편집 모달 */}
      <ProjectCreateModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProject(null);
        }}
        project={editingProject}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default ProjectSelector;