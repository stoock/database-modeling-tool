import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import Button from '../common/Button';
import Select from '../common/Select';
import Input from '../common/Input';

interface ProjectSectionProps {
  disabled?: boolean;
}

/**
 * 프로젝트 관리 섹션
 * - 프로젝트 선택 드롭다운
 * - 새 프로젝트 생성 (인라인 폼)
 * - 현재 프로젝트 정보 표시
 */
const ProjectSection: React.FC<ProjectSectionProps> = ({ disabled = false }) => {
  const {
    projects,
    currentProject,
    isLoading,
    loadProjects,
    setCurrentProject,
    createProject,
    updateProject,
    deleteProject
  } = useProjectStore();

  // 로컬 상태
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // 수정/삭제 관련 상태
  const [showEditForm, setShowEditForm] = useState(false);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 컴포넌트 마운트 시 프로젝트 목록 로드
  useEffect(() => {
    if (projects.length === 0 && !isLoading) {
      loadProjects();
    }
  }, [projects.length, isLoading, loadProjects]);

  // 프로젝트 선택 핸들러
  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
    }
  };

  // 새 프로젝트 생성 핸들러
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      const newProject = await createProject({
        name: newProjectName.trim(),
        description: newProjectDescription.trim() || undefined
      });
      
      // 생성된 프로젝트를 현재 프로젝트로 설정
      setCurrentProject(newProject);
      
      // 폼 초기화
      setNewProjectName('');
      setNewProjectDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // 새 프로젝트 폼 취소
  const handleCancelCreate = () => {
    setNewProjectName('');
    setNewProjectDescription('');
    setShowCreateForm(false);
  };

  // 프로젝트 수정 시작
  const handleEditProject = () => {
    if (!currentProject) return;
    
    setEditProjectName(currentProject.name);
    setEditProjectDescription(currentProject.description || '');
    setShowEditForm(true);
  };

  // 프로젝트 수정 저장
  const handleUpdateProject = async () => {
    if (!currentProject || !editProjectName.trim()) return;

    setIsUpdating(true);
    try {
      const updatedProject = await updateProject(currentProject.id, {
        name: editProjectName.trim(),
        description: editProjectDescription.trim() || undefined
      });
      
      // 현재 프로젝트 업데이트
      setCurrentProject(updatedProject);
      
      // 수정 폼 닫기
      setShowEditForm(false);
      setEditProjectName('');
      setEditProjectDescription('');
    } catch (error) {
      console.error('프로젝트 수정 실패:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 프로젝트 수정 취소
  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditProjectName('');
    setEditProjectDescription('');
  };

  // 프로젝트 삭제
  const handleDeleteProject = async () => {
    if (!currentProject) return;

    const confirmMessage = `"${currentProject.name}" 프로젝트를 완전히 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없으며, 프로젝트에 포함된 모든 테이블과 데이터가 함께 삭제됩니다.`;
    
    if (window.confirm(confirmMessage)) {
      setIsDeleting(true);
      try {
        await deleteProject(currentProject.id);
        
        // 현재 프로젝트 선택 해제
        setCurrentProject(null);
        
        // 프로젝트 목록 새로고침
        await loadProjects();
      } catch (error) {
        console.error('프로젝트 삭제 실패:', error);
        alert('프로젝트 삭제에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {/* 프로젝트 선택 */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 whitespace-nowrap">프로젝트:</span>
        <Select
          value={currentProject?.id || ''}
          onChange={(e) => handleProjectSelect(e.target.value)}
          disabled={disabled || isLoading}
          className="min-w-48"
          options={[
            { value: '', label: '선택하세요' },
            ...projects.map(project => ({
              value: project.id,
              label: project.name
            }))
          ]}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => setShowCreateForm(true)}
          disabled={disabled || showCreateForm || showEditForm}
          variant="outline"
          size="sm"
          className="whitespace-nowrap"
        >
          + 새 프로젝트
        </Button>
        
        {/* 현재 프로젝트가 있을 때만 수정/삭제 버튼 표시 */}
        {currentProject && (
          <>
            <button
              onClick={handleEditProject}
              disabled={disabled || showCreateForm || showEditForm || isDeleting}
              className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all p-1 rounded-md"
              title="프로젝트 수정"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDeleteProject}
              disabled={disabled || showCreateForm || showEditForm || isDeleting}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all p-1 rounded-md"
              title="프로젝트 삭제"
            >
              {isDeleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border border-gray-300 border-t-red-500"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </>
        )}
      </div>


      {/* 새 프로젝트 생성 모달 (전체 화면 오버레이) */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="font-medium text-gray-900 mb-4">새 프로젝트 생성</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프로젝트명 *
                </label>
                <Input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="프로젝트명을 입력하세요"
                  disabled={isCreating}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명 (선택)
                </label>
                <Input
                  type="text"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="프로젝트 설명을 입력하세요"
                  disabled={isCreating}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={handleCancelCreate}
                  variant="outline"
                  size="sm"
                  disabled={isCreating}
                >
                  취소
                </Button>
                <Button
                  onClick={handleCreateProject}
                  variant="primary"
                  size="sm"
                  disabled={!newProjectName.trim() || isCreating}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  {isCreating ? '생성 중...' : '생성'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 프로젝트 수정 모달 */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="font-medium text-gray-900 mb-4">프로젝트 수정</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프로젝트명 *
                </label>
                <Input
                  type="text"
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                  placeholder="프로젝트명을 입력하세요"
                  disabled={isUpdating}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명 (선택)
                </label>
                <Input
                  type="text"
                  value={editProjectDescription}
                  onChange={(e) => setEditProjectDescription(e.target.value)}
                  placeholder="프로젝트 설명을 입력하세요"
                  disabled={isUpdating}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  size="sm"
                  disabled={isUpdating}
                >
                  취소
                </Button>
                <Button
                  onClick={handleUpdateProject}
                  variant="primary"
                  size="sm"
                  disabled={!editProjectName.trim() || isUpdating}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  {isUpdating ? '저장 중...' : '저장'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
            <span className="text-sm">프로젝트 목록을 불러오는 중...</span>
          </div>
        </div>
      )}

      {/* 프로젝트가 없는 경우 */}
      {!isLoading && projects.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">아직 생성된 프로젝트가 없습니다.</p>
          <p className="text-sm">위의 "새 프로젝트" 버튼을 클릭하여 시작하세요.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectSection;