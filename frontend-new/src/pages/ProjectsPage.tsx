import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/stores/projectStore';
import ProjectCard from '@/components/projects/ProjectCard';
import CreateProjectDialog from '@/components/projects/CreateProjectDialog';
import DeleteProjectDialog from '@/components/projects/DeleteProjectDialog';
import type { Project } from '@/types';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, isLoading, error, fetchProjects } = useProjectStore();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // 컴포넌트 마운트 시 프로젝트 목록 조회
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // 프로젝트 선택 시 상세 페이지로 이동
  const handleSelectProject = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  // 프로젝트 삭제 다이얼로그 열기
  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  // 프로젝트 생성 성공 시
  const handleCreateSuccess = () => {
    fetchProjects();
  };

  // 프로젝트 삭제 성공 시
  const handleDeleteSuccess = () => {
    setProjectToDelete(null);
    fetchProjects();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">프로젝트 목록</h1>
            <p className="mt-2 text-muted-foreground">
              데이터베이스 모델링 프로젝트를 관리합니다
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="gap-2"
            aria-label="새 프로젝트 생성"
          >
            <Plus className="h-4 w-4" />
            새 프로젝트
          </Button>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-muted-foreground">프로젝트 목록을 불러오는 중...</span>
          </div>
        )}

        {/* 에러 상태 */}
        {error && !isLoading && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => fetchProjects()}
            >
              다시 시도
            </Button>
          </div>
        )}

        {/* 프로젝트 목록 */}
        {!isLoading && !error && (
          <>
            {projects.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                <div className="mx-auto max-w-md">
                  <h3 className="text-lg font-semibold text-gray-900">
                    프로젝트가 없습니다
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    새 프로젝트를 생성하여 데이터베이스 모델링을 시작하세요
                  </p>
                  <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="mt-6 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    첫 프로젝트 만들기
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={handleSelectProject}
                    onDelete={handleDeleteProject}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 프로젝트 생성 다이얼로그 */}
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      {/* 프로젝트 삭제 다이얼로그 */}
      <DeleteProjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        project={projectToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
