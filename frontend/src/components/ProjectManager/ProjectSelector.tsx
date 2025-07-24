import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, PlusIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { useProjectStore } from '../../stores/projectStore';
import { ProjectCreateModal } from './ProjectCreateModal';
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
    loadProjects, 
    isLoading 
  } = useProjectStore();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // 컴포넌트 마운트 시 프로젝트 목록 로드
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

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

  if (isLoading && projects.length === 0) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-gray-200 rounded-md"></div>
      </div>
    );
  }

  return (
    <>
      <div className={`relative ${className}`}>
        <Menu as="div" className="relative inline-block text-left w-full">
          <div>
            <Menu.Button className="inline-flex w-full justify-between items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <div className="flex items-center min-w-0 flex-1">
                {currentProject ? (
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 truncate">
                      {currentProject.name}
                    </div>
                    {currentProject.description && (
                      <div className="text-xs text-gray-500 truncate">
                        {currentProject.description}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500">프로젝트를 선택하세요</span>
                )}
              </div>
              <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
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
            <Menu.Items className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {/* 새 프로젝트 생성 */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } group flex w-full items-center px-4 py-2 text-sm`}
                    >
                      <PlusIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                      새 프로젝트 생성
                    </button>
                  )}
                </Menu.Item>

                {projects.length > 0 && (
                  <>
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    {/* 프로젝트 목록 */}
                    <div className="max-h-60 overflow-y-auto">
                      {projects.map((project) => (
                        <Menu.Item key={project.id}>
                          {({ active }) => (
                            <div
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } ${
                                currentProject?.id === project.id ? 'bg-blue-50' : ''
                              } group flex items-center justify-between px-4 py-2 text-sm cursor-pointer`}
                              onClick={() => handleProjectSelect(project)}
                            >
                              <div className="min-w-0 flex-1">
                                <div className={`font-medium truncate ${
                                  currentProject?.id === project.id 
                                    ? 'text-blue-900' 
                                    : 'text-gray-900'
                                }`}>
                                  {project.name}
                                </div>
                                {project.description && (
                                  <div className="text-xs text-gray-500 truncate">
                                    {project.description}
                                  </div>
                                )}
                                <div className="text-xs text-gray-400 mt-1">
                                  테이블 {project.tables?.length || 0}개
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => handleProjectEdit(project, e)}
                                  className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                  title="프로젝트 편집"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                
                                {onProjectSettings && (
                                  <button
                                    onClick={(e) => handleProjectSettings(project, e)}
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                    title="프로젝트 설정"
                                  >
                                    <Cog6ToothIcon className="w-4 h-4" />
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